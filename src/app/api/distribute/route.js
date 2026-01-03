import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';
import Ticket from '@/models/Ticket'; 

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// 1. টিকেট চেক করা (GET Request)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ticketInput = searchParams.get('ticketNumber'); // UI থেকে Ticket নামেই আসছে

    if (!ticketInput) {
      return NextResponse.json({ error: 'Ticket number required' }, { status: 400 });
    }

    // roll দিয়ে ডাটা খুঁজছি এবং .lean() ব্যবহার করছি যাতে পেইন অবজেক্ট পাই
    const ticket = await Ticket.findOne({ roll: ticketInput }).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found!' }, { status: 404 });
    }

    // লজিক: যদি isUsed ফিল্ড না থাকে, তাহলে false ধরে রেসপন্স পাঠাবো
    const responseData = {
        ...ticket,
        isUsed: ticket.isUsed === true // ফিল্ড না থাকলে false হবে
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ডিস্ট্রিবিউশন কনফার্ম (POST Request)
export async function POST(request) {
  try {
    await connectDB();
    const { ticketNumber } = await request.json(); // এখানে ticketNumber মানে আসলে roll

    const ticket = await Ticket.findOne({ roll: ticketNumber });
    
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    
    // ডাটাবেসে ফিল্ড না থাকলেও undefined মানে false, তাই এই চেক কাজ করবে
    if (ticket.isUsed) {
      return NextResponse.json({ error: 'This ticket has already been used!' }, { status: 400 });
    }

    // --- ইনভেন্টরি আপডেট লজিক ---
    const tshirtSize = ticket.tShirtSize; 
    const sizeField = `sizeStock.${tshirtSize}`;

    // ১. টি-শার্ট কমানো
    const tshirtUpdate = await KitItem.updateOne(
      { category: 'Sized', [sizeField]: { $gt: 0 } }, 
      { $inc: { [sizeField]: -1 } }
    );

    if (tshirtUpdate.modifiedCount === 0) {
      return NextResponse.json({ error: `Stock out for size ${tshirtSize}!` }, { status: 400 });
    }

    // ২. সাধারণ আইটেম কমানো
    await KitItem.updateMany(
      { category: 'General', stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    // --- ⭐ টিকেট স্ট্যাটাস আপডেট (নতুন ফিল্ড অ্যাড করা) ---
    // আমরা updateOne এবং $set ব্যবহার করছি, এতে ফিল্ড না থাকলেও নতুন অ্যাড হয়ে যাবে
    await Ticket.updateOne(
        { roll: ticketNumber },
        { $set: { isUsed: true } }
    );

    return NextResponse.json({ success: true, message: 'Kit distributed successfully!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}