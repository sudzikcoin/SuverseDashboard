import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Environment variables are automatically loaded from .env.local by Next.js
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@suverse.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

async function columnExists(table: string, column: string) {
  // PostgreSQL stores unquoted names in lowercase, so we need to check lowercase version
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
    table, column.toLowerCase()
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
  const pwdHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

  // 1) Try to find existing user
  let user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } }).catch(() => null);
  
  if (!user) {
    // Create new admin user using Prisma (safer than raw SQL)
    user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        hashedPassword: pwdHash,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created successfully!');
  } else {
    // User exists, ensure they have admin role and password
    user = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        role: 'ADMIN',
        hashedPassword: pwdHash,
        name: ADMIN_NAME,
      },
    });
    console.log('✅ Existing user updated to Admin!');
  }

  console.log('\n🔑 Admin Credentials:');
  console.log({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  console.log('\n📧 Login with:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

ensureAdmin()
  .then(() => process.exit(0))
  .catch((e) => { console.error('❌ Restore admin failed:', e); process.exit(1); });
