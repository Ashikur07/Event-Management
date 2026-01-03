import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';
import Ticket from '@/models/Ticket'; // তোমার মডেল (যেটা কালেকশনের সাথে কানেক্টেড)

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// 1. রোল নম্বর দিয়ে ইনফো চেক করা (Lookup)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const roll = searchParams.get('roll'); // ticketNumber এর বদলে roll

    if (!roll) {
      return NextResponse.json({ error: 'Roll number required' }, { status: 400 });
    }

    // রোল দিয়ে ডাটা খোঁজা
    const ticket = await Ticket.findOne({ roll });

    if (!ticket) {
      return NextResponse.json({ error: 'এই রোলের কোনো ডাটা পাওয়া যায়নি!' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ডিস্ট্রিবিউশন কনফার্ম করা (Inventory Update & Add isUsed)
export async function POST(request) {
  try {
    await connectDB();
    const { roll } = await request.json(); // বডি থেকে roll নিব

    // ১. আবার চেক করা
    const ticket = await Ticket.findOne({ roll });
    if (!ticket) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    
    // isUsed চেক (যদি ফিল্ড না থাকে, undefined আসবে যা false হিসেবে কাজ করবে)
    if (ticket.isUsed) {
      return NextResponse.json({ error: 'এই রোল নম্বরে ইতিমধ্যে কিট নেওয়া হয়েছে!' }, { status: 400 });
    }

    // ২. ইনভেন্টরি আপডেট লজিক (তোমার আগের লজিকই থাকছে)
    
    // A. Tshirt (Sized) কমানো
    const tshirtSize = ticket.tShirtSize; 
    const sizeField = `sizeStock.${tshirtSize}`;

    // Sized আইটেম আপডেট
    const tshirtUpdate = await KitItem.updateOne(
      { category: 'Sized', [sizeField]: { $gt: 0 } }, 
      { $inc: { [sizeField]: -1 } }
    );

    if (tshirtUpdate.modifiedCount === 0) {
      return NextResponse.json({ error: `স্টকে ${tshirtSize} সাইজের টি-শার্ট নেই!` }, { status: 400 });
    }

    // B. সব General আইটেম কমানো
    await KitItem.updateMany(
      { category: 'General', stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    // ৩. isUsed ফিল্ড অ্যাড করা বা true করা
    ticket.isUsed = true;
    await ticket.save();

    return NextResponse.json({ success: true, message: 'Kit distributed successfully!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}