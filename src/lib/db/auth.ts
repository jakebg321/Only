import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function createUser(email: string, password: string, role: UserRole) {
  const passwordHash = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
  });
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  return user;
}

export async function getUserWithDetails(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      creator: {
        include: {
          personality: true,
        },
      },
      subscriber: true,
      manager: true,
    },
  });
}