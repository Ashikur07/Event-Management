import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitItem from '@/models/KitItem';
import Ticket from '@/models/Ticket'; 

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

// 1. টিকেট চেক করা (আসলে রোল চেক হবে)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    // ফ্রন্টএন্ড থেকে 'ticketNumber' নামেই ডাটা আসবে
    const ticketInput = searchParams.get('ticketNumber'); 

    if (!ticketInput) {
      return NextResponse.json({ error: 'Ticket number required' }, { status: 400 });
    }

    // ⭐ মেইন লজিক: ইনপুট টিকেট নম্বর দিয়ে ডাটাবেসের 'roll' ফিল্ড খুঁজছি
    // যেহেতু roll স্ট্রিং, তাই সরাসরি ম্যাচ করবে
    const ticket = await Ticket.findOne({ roll: ticketInput });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found!' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. ডিস্ট্রিবিউশন কনফার্ম
export async function POST(request) {
  try {
    await connectDB();
    const { ticketNumber } = await request.json(); // এখানেও ticketNumber রিসিভ করছি

    // ⭐ আবার roll দিয়ে খুঁজছি
    const ticket = await Ticket.findOne({ roll: ticketNumber });
    
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    
    if (ticket.isUsed) {
      return NextResponse.json({ error: 'This ticket has already been used!' }, { status: 400 });
    }

    // --- ইনভেন্টরি আপডেট লজিক (আগের মতোই) ---
    const tshirtSize = ticket.tShirtSize; 
    const sizeField = `sizeStock.${tshirtSize}`;

    const tshirtUpdate = await KitItem.updateOne(
      { category: 'Sized', [sizeField]: { $gt: 0 } }, 
      { $inc: { [sizeField]: -1 } }
    );

    if (tshirtUpdate.modifiedCount === 0) {
      return NextResponse.json({ error: `Stock out for size ${tshirtSize}!` }, { status: 400 });
    }

    await KitItem.updateMany(
      { category: 'General', stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    );

    // --- স্ট্যাটাস আপডেট ---
    ticket.isUsed = true;
    await ticket.save();

    return NextResponse.json({ success: true, message: 'Kit distributed successfully!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}