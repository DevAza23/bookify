import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { telegramId: BigInt(123456789) },
    update: {},
    create: {
      telegramId: BigInt(123456789),
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { telegramId: BigInt(987654321) },
    update: {},
    create: {
      telegramId: BigInt(987654321),
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
    },
  });

  console.log('✅ Created users');

  // Create demo event 1: Tech Meetup
  const event1 = await prisma.event.create({
    data: {
      slug: 'tech-meetup-2024',
      title: 'Tech Meetup 2024',
      description: 'Join us for an exciting tech meetup featuring talks on AI, Web3, and modern web development. Network with fellow developers and enjoy refreshments!',
      coverImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      startDate: new Date('2024-06-15T18:00:00Z'),
      endDate: new Date('2024-06-15T21:00:00Z'),
      timezone: 'America/New_York',
      location: 'Tech Hub, 123 Main St, New York, NY',
      locationType: 'IN_PERSON',
      capacity: 50,
      priceType: 'FREE',
      isPublic: true,
      status: 'PUBLISHED',
      hostRoles: {
        create: {
          userId: user1.id,
          role: 'HOST',
        },
      },
      questions: {
        create: [
          {
            question: 'What is your dietary preference?',
            type: 'SELECT',
            isRequired: false,
            options: JSON.stringify(['Vegetarian', 'Vegan', 'Gluten-free', 'No preference']),
            order: 0,
          },
          {
            question: 'How did you hear about this event?',
            type: 'TEXT',
            isRequired: false,
            order: 1,
          },
        ],
      },
    },
  });

  // Create demo event 2: Online Workshop
  const event2 = await prisma.event.create({
    data: {
      slug: 'nextjs-workshop',
      title: 'Next.js 14 Workshop',
      description: 'Learn Next.js 14 App Router, Server Components, and advanced patterns. Perfect for developers looking to level up their React skills.',
      coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      startDate: new Date('2024-07-01T14:00:00Z'),
      endDate: new Date('2024-07-01T17:00:00Z'),
      timezone: 'UTC',
      locationType: 'ONLINE',
      onlineLink: 'https://zoom.us/j/123456789',
      capacity: 100,
      priceType: 'FREE',
      isPublic: true,
      status: 'PUBLISHED',
      hostRoles: {
        create: {
          userId: user2.id,
          role: 'HOST',
        },
      },
      questions: {
        create: [
          {
            question: 'What is your experience level with Next.js?',
            type: 'SELECT',
            isRequired: true,
            options: JSON.stringify(['Beginner', 'Intermediate', 'Advanced']),
            order: 0,
          },
        ],
      },
    },
  });

  console.log('✅ Created events');

  // Create some RSVPs
  await prisma.rSVP.create({
    data: {
      eventId: event1.id,
      userId: user2.id,
      status: 'CONFIRMED',
      guestCount: 1,
      name: 'Jane Smith',
      email: 'jane@example.com',
      consentGiven: true,
    },
  });

  await prisma.rSVP.create({
    data: {
      eventId: event2.id,
      userId: user1.id,
      status: 'CONFIRMED',
      guestCount: 1,
      name: 'John Doe',
      email: 'john@example.com',
      consentGiven: true,
    },
  });

  console.log('✅ Created RSVPs');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

