import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken, generateRefreshToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriber: true,
        creator: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Get display name based on role
    let displayName = email.split('@')[0];
    if (user.role === 'SUBSCRIBER' && user.subscriber) {
      displayName = user.subscriber.displayName || displayName;
    } else if (user.role === 'CREATOR' && user.creator) {
      displayName = user.creator.displayName;
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName,
        isActive: user.isActive,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}