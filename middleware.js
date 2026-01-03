import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // ১. পাবলিক পাথ (যেখানে লগইন ছাড়াই যাওয়া যাবে)
  const isPublicPath = path === '/login' || path.startsWith('/api/');
  
  // ২. কুকি চেক করা
  const token = request.cookies.get('app_role')?.value;

  // ৩. যদি লগইন না থাকে এবং পাবলিক পেজে না থাকে -> লগইন পেজে পাঠাও
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ৪. যদি লগইন করা থাকে এবং লগইন পেজে যেতে চায় -> হোমে পাঠাও
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// কোন কোন পাথে মিডলওয়্যার কাজ করবে
export const config = {
  matcher: [
    '/',
    '/kits/:path*',
    '/profile',
    '/login',
  ],
};