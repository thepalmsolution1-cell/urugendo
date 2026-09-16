/**
 * Ensures at least one VERIFIED provider exists so booking smoke tests work.
 * Usage: node src/scripts/seed-verified-provider.js
 */
const prisma = require('../lib/prisma');

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'verified.provider@urugendo.local' },
    update: { role: 'PROVIDER', name: 'Verified Provider' },
    create: {
      email: 'verified.provider@urugendo.local',
      name: 'Verified Provider',
      role: 'PROVIDER',
      passwordHash: null,
    },
  });

  let provider = await prisma.provider.findFirst({
    where: { userId: owner.id },
  });

  if (!provider) {
    provider = await prisma.provider.create({
      data: {
        name: 'Kigali Garden Bistro',
        category: 'RESTAURANT',
        description: 'Calm dinner spot for URUGENDO demos',
        contactEmail: 'bistro@urugendo.local',
        contactPhone: '+250780000099',
        location: 'Kigali',
        priceRangeMin: 15000,
        priceRangeMax: 80000,
        verificationStatus: 'VERIFIED',
        userId: owner.id,
        dataUpdatedAt: new Date(),
      },
    });
  } else if (provider.verificationStatus !== 'VERIFIED') {
    provider = await prisma.provider.update({
      where: { id: provider.id },
      data: { verificationStatus: 'VERIFIED', isActive: true },
    });
  }

  const experienceCount = await prisma.experience.count({
    where: { providerId: provider.id },
  });
  if (experienceCount === 0) {
    await prisma.experience.create({
      data: {
        name: 'Set Dinner for 2',
        description: 'Shared plates and calm ambiance',
        category: 'RESTAURANT',
        location: 'Kigali',
        priceRwf: 35000,
        durationMinutes: 90,
        capacity: 2,
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'VERIFIED',
        providerId: provider.id,
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        providerId: provider.id,
        providerName: provider.name,
        verificationStatus: provider.verificationStatus,
        ownerEmail: owner.email,
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
