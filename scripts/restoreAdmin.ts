import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@suverse.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
    table, column
  );
  return rows && rows.length > 0;
}

// Try to detect actual table & column names
async function detect() {
  // Prisma usually pluralizes to "User" model -> "User" table or "users"
  // We'll probe both to maximize compatibility.
  const candidates = ['User', 'users'];
  for (const t of candidates) {
    const ok = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1 LIMIT 1`, t
    );
    if (ok && ok.length) {
      const hasHashed = await columnExists(t, 'hashedPassword');
      const hasPassword = await columnExists(t, 'password');
      const hasRole = await columnExists(t, 'role');
      const hasIsAdmin = await columnExists(t, 'isAdmin');
      const hasEmail = await columnExists(t, 'email');
      const hasName = await columnExists(t, 'name');
      return { table: t, hasHashed, hasPassword, hasRole, hasIsAdmin, hasEmail, hasName };
    }
  }
  throw new Error('Could not find users table (tried "User" and "users").');
}

async function ensureAdmin() {
  const d = await detect();

  // 1) find user by email using Prisma model (fallback to raw if needed)
  let user = await prisma.user?.findUnique?.({ where: { email: ADMIN_EMAIL } } as any).catch(() => null);
  if (!user) {
    // Create new user via raw insert to handle various column names
    const pwdHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

    const cols = ['email'];
    const vals = [`'${ADMIN_EMAIL}'`];
    if (d.hasName) { cols.push('name'); vals.push(`'${ADMIN_NAME}'`); }
    if (d.hasHashed) { cols.push('hashedPassword'); vals.push(`'${pwdHash}'`); }
    else if (d.hasPassword) { cols.push('password'); vals.push(`'${pwdHash}'`); }

    const insertSql = `INSERT INTO "${d.table}" (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *;`;
    const rows: any[] = await prisma.$queryRawUnsafe(insertSql);
    user = rows?.[0];
    if (!user) throw new Error('Insert admin failed.');
  }

  // 2) Elevate to admin
  if (d.hasRole) {
    await prisma.$executeRawUnsafe(`UPDATE "${d.table}" SET role='ADMIN' WHERE email=$1`, ADMIN_EMAIL);
  } else if (d.hasIsAdmin) {
    await prisma.$executeRawUnsafe(`UPDATE "${d.table}" SET "isAdmin"=true WHERE email=$1`, ADMIN_EMAIL);
  } else {
    console.warn('No role/isAdmin column found. Skipping role elevation.');
  }

  // Fetch back
  const row: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "${d.table}" WHERE email=$1 LIMIT 1`, ADMIN_EMAIL);
  const finalUser = row?.[0] || user;

  console.log('✅ Admin restored/created:');
  console.log({
    id: finalUser?.id,
    email: finalUser?.email,
    role: finalUser?.role ?? (finalUser?.isAdmin ? 'ADMIN (isAdmin=true)' : 'UNKNOWN'),
  });
  console.log('Use these creds to login:');
  console.log({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
}

ensureAdmin()
  .then(() => process.exit(0))
  .catch((e) => { console.error('❌ Restore admin failed:', e); process.exit(1); });
