import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // ✅ নতুন কোড: যদি পাথ '/install' হয়, তাহলে সব চেক বাদ দিয়ে পেজ ওপেন করতে দাও
  if (path === '/install') {
    return NextResponse.next();
  }

  // --- তোমার আগের লজিক (উদাহরণস্বরূপ) ---
  const token = request.cookies.get('app_role')?.value; // বা তোমার কুকির নাম

  // যদি টোকেন না থাকে এবং ইউজার লগইন পেজে না থাকে, তবে লগইনে পাঠাও
  if (!token && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // যদি টোকেন থাকে কিন্তু ইউজার লগইন পেজে থাকে, তবে হোমে পাঠাও
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// কনফিগারেশন যেমন আছে তেমনই রাখতে পারো, অথবা '/install' কে matcher এ রাখতে পারো
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};