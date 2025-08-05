import { prisma } from '@/lib/prisma';
import { PersonalityTone } from '@prisma/client';

export async function createCreatorProfile(
  userId: string,
  displayName: string,
  subscriptionPrice: number
) {
  return prisma.creator.create({
    data: {
      userId,
      displayName,
      subscriptionPrice,
    },
  });
}

export async function updateCreatorPersonality(
  creatorId: string,
  data: {
    tone?: PersonalityTone;
    greetingMessage?: string;
    interests?: string[];
    boundaries?: string[];
    customInstructions?: string;
    responseStyle?: string;
    languagePreferences?: string[];
    maxResponseLength?: number;
    enableEmojis?: boolean;
    enableMediaSuggestions?: boolean;
  }
) {
  const existing = await prisma.creatorPersonality.findUnique({
    where: { creatorId },
  });

  if (existing) {
    return prisma.creatorPersonality.update({
      where: { creatorId },
      data,
    });
  }

  return prisma.creatorPersonality.create({
    data: {
      creatorId,
      greetingMessage: data.greetingMessage || "Hey there! 💕 So glad you're here!",
      ...data,
    },
  });
}

export async function getCreatorAnalytics(creatorId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return prisma.analytics.findMany({
    where: {
      creatorId,
      date: {
        gte: startDate,
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function updateDailyAnalytics(
  creatorId: string,
  data: {
    messagesSent?: number;
    aiResponses?: number;
    revenueGenerated?: number;
    newSubscribers?: number;
    activeChats?: number;
    contentGenerated?: number;
  }
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.analytics.findUnique({
    where: {
      creatorId_date: {
        creatorId,
        date: today,
      },
    },
  });

  if (existing) {
    return prisma.analytics.update({
      where: { id: existing.id },
      data: {
        messagesSent: { increment: data.messagesSent || 0 },
        aiResponses: { increment: data.aiResponses || 0 },
        revenueGenerated: { increment: data.revenueGenerated || 0 },
        newSubscribers: { increment: data.newSubscribers || 0 },
        activeChats: data.activeChats || existing.activeChats,
        contentGenerated: { increment: data.contentGenerated || 0 },
      },
    });
  }

  return prisma.analytics.create({
    data: {
      creatorId,
      date: today,
      ...data,
    },
  });
}