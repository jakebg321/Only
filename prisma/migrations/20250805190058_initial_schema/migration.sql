-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CREATOR', 'MANAGER', 'SUBSCRIBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."MessageSender" AS ENUM ('SUBSCRIBER', 'AI', 'CREATOR');

-- CreateEnum
CREATE TYPE "public"."ContentRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PersonalityTone" AS ENUM ('FLIRTY', 'FRIENDLY', 'MYSTERIOUS', 'PROFESSIONAL', 'PLAYFUL', 'DOMINANT', 'SUBMISSIVE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Creator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "subscriptionPrice" DECIMAL(10,2) NOT NULL,
    "aiModelTrained" BOOLEAN NOT NULL DEFAULT false,
    "aiModelUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreatorPersonality" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tone" "public"."PersonalityTone" NOT NULL DEFAULT 'FRIENDLY',
    "greetingMessage" TEXT NOT NULL,
    "interests" TEXT[],
    "boundaries" TEXT[],
    "customInstructions" TEXT,
    "responseStyle" TEXT,
    "languagePreferences" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "maxResponseLength" INTEGER NOT NULL DEFAULT 500,
    "enableEmojis" BOOLEAN NOT NULL DEFAULT true,
    "enableMediaSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPersonality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscriber" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 20,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreatorSubscriber" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "monthlyAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CreatorSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManagerCreator" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ManagerCreator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatSession" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" "public"."MessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "mediaUrl" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResponseTemplate" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "triggerPhrase" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentRequest" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "public"."ContentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "resultUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ContentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analytics" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "aiResponses" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "newSubscribers" INTEGER NOT NULL DEFAULT 0,
    "activeChats" INTEGER NOT NULL DEFAULT 0,
    "contentGenerated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "public"."Creator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPersonality_creatorId_key" ON "public"."CreatorPersonality"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_userId_key" ON "public"."Subscriber"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_userId_key" ON "public"."Manager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorSubscriber_creatorId_subscriberId_key" ON "public"."CreatorSubscriber"("creatorId", "subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerCreator_managerId_creatorId_key" ON "public"."ManagerCreator"("managerId", "creatorId");

-- CreateIndex
CREATE INDEX "ChatSession_creatorId_subscriberId_idx" ON "public"."ChatSession"("creatorId", "subscriberId");

-- CreateIndex
CREATE INDEX "Message_sessionId_createdAt_idx" ON "public"."Message"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ResponseTemplate_creatorId_category_idx" ON "public"."ResponseTemplate"("creatorId", "category");

-- CreateIndex
CREATE INDEX "ContentRequest_creatorId_status_idx" ON "public"."ContentRequest"("creatorId", "status");

-- CreateIndex
CREATE INDEX "Analytics_creatorId_date_idx" ON "public"."Analytics"("creatorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_creatorId_date_key" ON "public"."Analytics"("creatorId", "date");

-- AddForeignKey
ALTER TABLE "public"."Creator" ADD CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreatorPersonality" ADD CONSTRAINT "CreatorPersonality_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscriber" ADD CONSTRAINT "Subscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreatorSubscriber" ADD CONSTRAINT "CreatorSubscriber_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreatorSubscriber" ADD CONSTRAINT "CreatorSubscriber_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManagerCreator" ADD CONSTRAINT "ManagerCreator_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManagerCreator" ADD CONSTRAINT "ManagerCreator_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatSession" ADD CONSTRAINT "ChatSession_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResponseTemplate" ADD CONSTRAINT "ResponseTemplate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentRequest" ADD CONSTRAINT "ContentRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentRequest" ADD CONSTRAINT "ContentRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
