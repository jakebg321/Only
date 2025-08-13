import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, generateToken, generateRefreshToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, role } = await request.json();

    // Validate input
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['SUBSCRIBER', 'CREATOR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: role as UserRole,
        },
      });

      // Create role-specific profile
      if (role === 'SUBSCRIBER') {
        await tx.subscriber.create({
          data: {
            userId: user.id,
            displayName,
          },
        });
      } else if (role === 'CREATOR') {
        await tx.creator.create({
          data: {
            userId: user.id,
            displayName,
            subscriptionPrice: 25.00, // Default price
            bio: `Hey there! I'm ${displayName} 💕`,
          },
        });

        // Create default personality for creator
        await tx.creatorPersonality.create({
          data: {
            creatorId: user.id,
            greetingMessage: `Hey babe! Thanks for subscribing to my page 😘`,
            interests: ['fitness', 'fashion', 'travel', 'photography'],
            boundaries: ['No personal meetups', 'No illegal content'],
            responseStyle: 'Flirty and engaging',
          },
        });
      }

      return user;
    });

    // Generate tokens
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken(newUser.id);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        displayName,
        isActive: newUser.isActive,
      },
      token,
    });

    // Set HTTP-only cookie for refresh token
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Set auth token cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}