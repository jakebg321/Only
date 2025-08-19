import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate API requests
 * Checks for authToken cookie and verifies JWT
 */
export async function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Get token from cookie
      const token = request.cookies.get('authToken')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token (safe to use JWT in API routes - Node.js runtime)
      const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
      
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET) as any;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // Add user info to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      return await handler(authenticatedRequest);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Validate request body with required fields
 */
export function validateRequestBody(requiredFields: string[]) {
  return (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (request: AuthenticatedRequest) => {
      try {
        const body = await request.json();
        
        for (const field of requiredFields) {
          if (!body[field]) {
            return NextResponse.json(
              { error: `${field} is required` },
              { status: 400 }
            );
          }
        }

        // Re-create request with parsed body for convenience
        (request as any).body = body;

        return await handler(request);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }
    };
  };
}

/**
 * Handle errors consistently across API routes
 */
export function withErrorHandling(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API error:', error);
      
      // Return appropriate error response
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Compose middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}