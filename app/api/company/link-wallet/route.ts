import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeAudit } from '@/lib/audit';
import { z } from 'zod';

const linkWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

/**
 * POST /api/company/link-wallet
 * Links or updates the wallet address for the current user's company.
 * 
 * Security:
 * - Only COMPANY role users can link wallets
 * - User must be associated with a company
 * - Wallet address is validated as valid Ethereum address
 * - Audit log created for wallet linking/updating
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Only company users can link wallets' },
        { status: 403 }
      );
    }

    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: 'User is not associated with a company' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = linkWalletSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid wallet address', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { walletAddress } = validation.data;

    // Normalize to lowercase for consistent storage
    const normalizedAddress = walletAddress.toLowerCase();

    // Get current company data to check if wallet is being updated
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { walletAddress: true, legalName: true },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const isUpdate = !!company.walletAddress;
    const previousWallet = company.walletAddress;

    // Update company wallet address
    await prisma.company.update({
      where: { id: companyId },
      data: { walletAddress: normalizedAddress },
    });

    // Create audit log
    await writeAudit({
      action: isUpdate ? 'UPDATE' : 'CREATE',
      entity: 'COMPANY',
      entityId: companyId,
      actorId: session.user.id,
      actorEmail: session.user.email,
      companyId: companyId,
      details: {
        action: isUpdate ? 'wallet_updated' : 'wallet_linked',
        walletAddress: normalizedAddress,
        ...(isUpdate && { previousWallet }),
        companyName: company.legalName,
      },
    });

    console.log(
      `[LinkWallet] ${isUpdate ? 'Updated' : 'Linked'} wallet ${normalizedAddress} for company ${companyId}`
    );

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Wallet updated successfully' : 'Wallet linked successfully',
      walletAddress: normalizedAddress,
    });
  } catch (error) {
    console.error('[LinkWallet] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
