import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const defaultTenantId = '8009f686-1b9e-4098-aa19-81b870a5e0c8';
  const superadminId = 'cf4b7283-4ae9-443b-a580-3ccfc9fd4312';
  const adminId = 'cf4b7283-4ae9-443b-a580-3ccfc9fd4313';

  // 1. Create Default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { phone: '0000000000' },
    update: {},
    create: {
      id: defaultTenantId,
      name: 'System Tenant',
      phone: '0000000000',
    },
  });

  console.log('Seed: Default Tenant created/updated');

  // 2. Insert Superadmin
  // Hash provided: $2b$10$jIabyGkuA3Diyp4vbJIay.5OUneSpmNEdTGtT9YWgLAhRfT5d1jp2 (usually 'password123')
  await prisma.user.upsert({
    where: { email: 'superadmin@autoorder-ai.com' },
    update: {},
    create: {
      id: superadminId,
      tenantId: tenant.id,
      email: 'superadmin@autoorder-ai.com',
      password: '$2b$10$jIabyGkuA3Diyp4vbJIay.5OUneSpmNEdTGtT9YWgLAhRfT5d1jp2',
      role: UserRole.SUPERADMIN,
      superadminKey: '74c055a08d4053b4f694deee3d0e0d477a7691bf311285f72d9b2c7918193f22',
    },
  });

  console.log('Seed: Superadmin user created/updated');

  // 3. Insert Admin
  await prisma.user.upsert({
    where: { email: 'admin@autoorder-ai.com' },
    update: {},
    create: {
      id: adminId,
      tenantId: tenant.id,
      email: 'admin@autoorder-ai.com',
      password: '$2b$10$jIabyGkuA3Diyp4vbJIay.5OUneSpmNEdTGtT9YWgLAhRfT5d1jp2',
      role: UserRole.ADMIN,
    },
  });

  console.log('Seed: Admin user created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
