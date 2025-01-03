import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the origin of the request
  const origin = request.headers.get('origin') || '';

  // Define allowed origins
  const allowedOrigins = [
    'https://crm-gamma-seven.vercel.app',
    'https://crm.chembiolifescience.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Set CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // If origin is allowed, set the Allow-Origin header
  if (isAllowedOrigin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  // Forward the request with CORS headers
  const response = NextResponse.next();
  
  // Add the CORS headers to the response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
