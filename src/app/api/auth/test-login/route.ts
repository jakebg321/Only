import { NextRequest, NextResponse } from 'next/server';
import { generateToken, generateRefreshToken } from '@/lib/auth';

// Test accounts that work without database
const TEST_ACCOUNTS = {
  'test@example.com': {
    password: 'test123',
    user: {
      id: 'test_user_1',
      email: 'test@example.com',
      role: 'SUBSCRIBER',
      displayName: 'Test User',
      isActive: true
    }
  },
  'creator@example.com': {
    password: 'creator123',
    user: {
      id: 'test_creator_1',
      email: 'creator@example.com',
      role: 'CREATOR',
      displayName: 'Test Creator',
      isActive: true
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Check if it's a test account
    const testAccount = TEST_ACCOUNTS[email as keyof typeof TEST_ACCOUNTS];
    
    if (!testAccount || testAccount.password !== password) {
      return NextResponse.json(
        { error: 'Invalid test credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const token = generateToken({
      id: testAccount.user.id,
      email: testAccount.user.email,
      role: testAccount.user.role as any,
    });
    const refreshToken = generateRefreshToken(testAccount.user.id);

    // Prepare response
    const response = NextResponse.json({
      success: true,
      user: testAccount.user,
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

    console.log('Test login successful for:', email);
    return response;
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during test login' },
      { status: 500 }
    );
  }
}