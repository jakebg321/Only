import { PrismaClient, UserRole, PersonalityTone } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create TEST ACCOUNT for development
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('testpass123', 10),
      role: UserRole.SUBSCRIBER,
    },
  });
  console.log('✅ Created test account: test@example.com / testpass123');

  // Create test users
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@example.com' },
    update: {},
    create: {
      email: 'creator@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: UserRole.CREATOR,
    },
  });

  const subscriberUser = await prisma.user.upsert({
    where: { email: 'subscriber@example.com' },
    update: {},
    create: {
      email: 'subscriber@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: UserRole.SUBSCRIBER,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: UserRole.MANAGER,
    },
  });

  // Create creator profile
  const creator = await prisma.creator.upsert({
    where: { userId: creatorUser.id },
    update: {},
    create: {
      userId: creatorUser.id,
      displayName: 'Sophia Rose',
      bio: 'Your favorite AI-powered content creator 💕',
      subscriptionPrice: 29.99,
      aiModelTrained: true,
    },
  });

  // Create creator personality
  await prisma.creatorPersonality.upsert({
    where: { creatorId: creator.id },
    update: {},
    create: {
      creatorId: creator.id,
      tone: PersonalityTone.FLIRTY,
      greetingMessage: 'Hey babe! 😘 So excited you\'re here! What kind of content are you in the mood for today?',
      interests: ['fitness', 'fashion', 'travel', 'photography'],
      boundaries: ['no extreme requests', 'keep it respectful', 'no personal meetups'],
      customInstructions: 'Always be friendly and engaging, use emojis, keep responses flirty but tasteful',
      responseStyle: 'Playful and teasing with lots of emojis',
      languagePreferences: ['en'],
      maxResponseLength: 300,
      enableEmojis: true,
      enableMediaSuggestions: true,
    },
  });

  // Create test subscriber profile
  const testSubscriber = await prisma.subscriber.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      displayName: 'Test User',
    },
  });

  // Create subscriber profile
  const subscriber = await prisma.subscriber.upsert({
    where: { userId: subscriberUser.id },
    update: {},
    create: {
      userId: subscriberUser.id,
      displayName: 'John Doe',
    },
  });

  // Create manager profile
  const manager = await prisma.manager.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      companyName: 'Elite Talent Management',
      commissionRate: 20,
    },
  });

  // Create subscription relationship (upsert to avoid duplicates)
  await prisma.creatorSubscriber.upsert({
    where: {
      creatorId_subscriberId: {
        creatorId: creator.id,
        subscriberId: subscriber.id,
      },
    },
    update: {
      monthlyAmount: 29.99,
      isActive: true,
    },
    create: {
      creatorId: creator.id,
      subscriberId: subscriber.id,
      monthlyAmount: 29.99,
      isActive: true,
    },
  });

  // Create manager-creator relationship (upsert to avoid duplicates)
  await prisma.managerCreator.upsert({
    where: {
      managerId_creatorId: {
        managerId: manager.id,
        creatorId: creator.id,
      },
    },
    update: {
      isActive: true,
    },
    create: {
      managerId: manager.id,
      creatorId: creator.id,
      isActive: true,
    },
  });

  // Create some response templates
  const templates = [
    {
      triggerPhrase: 'custom photo',
      responseText: 'I\'d love to create something special just for you! 📸 What kind of vibe are you looking for?',
      category: 'content_request',
    },
    {
      triggerPhrase: 'how are you',
      responseText: 'I\'m doing amazing, especially now that you\'re here! 😊 How about you, babe?',
      category: 'greeting',
    },
    {
      triggerPhrase: 'miss you',
      responseText: 'Aww, I\'ve been thinking about you too! 💕 Want me to send you something special?',
      category: 'affection',
    },
  ];

  for (const template of templates) {
    await prisma.responseTemplate.create({
      data: {
        creatorId: creator.id,
        ...template,
      },
    });
  }

  // Create a chat session with some messages
  const chatSession = await prisma.chatSession.create({
    data: {
      creatorId: creator.id,
      subscriberId: subscriber.id,
    },
  });

  // Add some sample messages
  await prisma.message.create({
    data: {
      sessionId: chatSession.id,
      senderType: 'SUBSCRIBER',
      content: 'Hey Sophia! How are you today?',
    },
  });

  await prisma.message.create({
    data: {
      sessionId: chatSession.id,
      senderType: 'AI',
      content: 'Hey babe! 😘 I\'m doing amazing, especially now that you\'re here! Been working on some hot new content today. What kind of mood are you in?',
      isAiGenerated: true,
      aiConfidenceScore: 0.95,
    },
  });

  // Create initial analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.analytics.create({
    data: {
      creatorId: creator.id,
      date: today,
      messagesSent: 150,
      aiResponses: 120,
      revenueGenerated: 450.50,
      newSubscribers: 5,
      activeChats: 25,
      contentGenerated: 10,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('Creator: creator@example.com / password123');
  console.log('Subscriber: subscriber@example.com / password123');
  console.log('Manager: manager@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });