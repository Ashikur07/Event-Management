import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password, type } = await request.json();

  let role = null;

  // ১. ভিউয়ার চেক
  if (type === 'viewer') {
    role = 'viewer';
  } 
  // ২. পাসওয়ার্ড চেক (Admin)
  else if (password === process.env.ADMIN_PASS) {
    role = 'admin';
  } 
  // ৩. পাসওয়ার্ড চেক (Moderator)
  else if (password === process.env.MOD_PASS) {
    role = 'moderator';
  } 
  // ৪. ভুল পাসওয়ার্ড
  else {
    return NextResponse.json({ error: 'Wrong Password!' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role });

  // ৫. কুকি সেট করা (সরাসরি রোল সেভ করা হচ্ছে, কোনো টোকেন এনক্রিপশন ছাড়া)
  
  // কুকি ১: সিকিউরিটি চেকের জন্য (HttpOnly)
  response.cookies.set('session_token', role, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 10 // ১০ দিন
  });

  // কুকি ২: ফ্রন্টএন্ডের জন্য (UI তে দেখানোর জন্য)
  response.cookies.set('app_role', role, {
    httpOnly: false, // এটা ক্লায়েন্ট সাইড থেকে পড়া যাবে
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 10
  });

  return response;
}