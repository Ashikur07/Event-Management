import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // ১. পাবলিক পাথ (যেখানে লগইন ছাড়াই যাওয়া যাবে)
  // লোগো বা স্ট্যাটিক ফাইলের জন্য পাবলিক ফোল্ডারও এর মধ্যে ধরা ভালো
  const isPublicPath = path === '/login' || path.startsWith('/api/login') || path.startsWith('/_next');
  
  // ২. কুকি চেক করা
  const token = request.cookies.get('app_role')?.value;

  // ৩. লজিক: যদি কুকি না থাকে এবং ইউজার পাবলিক পেজে না থাকে -> লগইন পেজে পাঠাও
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ৪. লজিক: যদি কুকি থাকে এবং ইউজার লগইন পেজে যেতে চায় -> হোমে পাঠাও
  if (token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // সব ঠিক থাকলে রিকোয়েস্ট চালিয়ে যাও
  return NextResponse.next();
}

// কোন কোন পাথে মিডলওয়্যার কাজ করবে
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