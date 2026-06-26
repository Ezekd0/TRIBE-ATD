const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tribe.com' },
    update: {},
    create: {
      email: 'admin@tribe.com',
      passwordHash: passwordHash,
      fullName: 'Cave Tribe Admin',
      phone: '+10000000000',
      gender: 'Other',
      address: 'Classified',
      postalCode: '00000',
      emergencyName: 'Classified',
      emergencyPhone: 'Classified',
      status: 'ACTIVE',
      role: 'super_admin',
      tribeNumber: 'TRB-ADMIN-01'
    },
  });

  console.log('Seeded Admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
