/**
 * Dev seed for Owen smoke tests: admin, provider owner, guest user.
 * Usage: node src/scripts/seed-owen-dev.js
 */
const prisma = require('../lib/prisma');

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@urugendo.local' },
    update: { role: 'ADMIN', name: 'Admin User' },
    create: {
      email: 'admin@urugendo.local',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const providerOwner = await prisma.user.upsert({
    where: { email: 'provider@urugendo.local' },
    update: { role: 'USER', name: 'Provider Owner' },
    create: {
      email: 'provider@urugendo.local',
      name: 'Provider Owner',
      role: 'USER',
    },
  });

  const guest = await prisma.user.upsert({
    where: { email: 'guest@urugendo.local' },
    update: { role: 'USER', name: 'Guest User' },
    create: {
      email: 'guest@urugendo.local',
      name: 'Guest User',
      role: 'USER',
    },
  });

  console.log(
    JSON.stringify(
      {
        adminId: admin.id,
        providerOwnerId: providerOwner.id,
        guestId: guest.id,
        hint: 'Send header X-User-Id with one of these ids',
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
