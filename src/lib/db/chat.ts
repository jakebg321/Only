import { prisma } from '@/lib/prisma';
import { MessageSender } from '@prisma/client';

export async function getOrCreateChatSession(creatorId: string, subscriberId: string) {
  const existingSession = await prisma.chatSession.findFirst({
    where: {
      creatorId,
      subscriberId,
      isActive: true,
    },
  });

  if (existingSession) {
    return existingSession;
  }

  return prisma.chatSession.create({
    data: {
      creatorId,
      subscriberId,
    },
  });
}

export async function sendMessage(
  sessionId: string,
  senderType: MessageSender,
  content: string,
  isAiGenerated = false,
  aiConfidenceScore?: number
) {
  const message = await prisma.message.create({
    data: {
      sessionId,
      senderType,
      content,
      isAiGenerated,
      aiConfidenceScore,
    },
  });

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      lastMessageAt: new Date(),
      totalMessages: { increment: 1 },
    },
  });

  return message;
}

export async function getChatHistory(sessionId: string, limit = 50) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getCreatorPersonality(creatorId: string) {
  return prisma.creatorPersonality.findUnique({
    where: { creatorId },
  });
}

export async function updateResponseTemplate(creatorId: string, triggerPhrase: string) {
  return prisma.responseTemplate.updateMany({
    where: {
      creatorId,
      triggerPhrase,
    },
    data: {
      usageCount: { increment: 1 },
    },
  });
}