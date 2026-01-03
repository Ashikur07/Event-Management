import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password, type } = await request.json(); // type = 'viewer' হলে পাসওয়ার্ড লাগবে না

  let role = null;

  // ১. ভিউয়ার হলে সরাসরি এক্সেস
  if (type === 'viewer') {
    role = 'viewer';
  } 
  // ২. পাসওয়ার্ড চেক
  else if (password === process.env.ADMIN_PASS) {
    role = 'admin';
  } else if (password === process.env.MOD_PASS) {
    role = 'moderator';
  } else {
    return NextResponse.json({ error: 'Wrong Password!' }, { status: 401 });
  }

  // ৩. কুকি সেট করা (1 দিনের জন্য)
  const response = NextResponse.json({ success: true, role });
  
  response.cookies.set('app_role', role, {
    httpOnly: false, // ক্লায়েন্ট সাইডে রিড করার জন্য false রাখলাম (সিম্পলিসিটির জন্য)
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 10 // 1 day
  });

  return response;
}