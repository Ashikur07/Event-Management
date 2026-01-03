import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Ticket from '@/models/Ticket';

const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 15;
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || 'distributed'; 

  try {
    const query = {};
    
    // ১. স্ট্যাটাস ফিল্টার
    if (filter === 'pending') {
        query.isUsed = false;
    } else {
        query.isUsed = true;
    }

    // ২. সার্চ লজিক
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } },
        { session: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    // ডাটা আনা (lean ব্যবহার করা হয়েছে ফাস্ট পারফরমেন্সের জন্য)
    const history = await Ticket.find(query)
      .sort({ updatedAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalDocs = await Ticket.countDocuments(query);

    // ৩. স্ট্যাটাস কাউন্ট
    const totalDistributed = await Ticket.countDocuments({ isUsed: true });
    const totalPending = await Ticket.countDocuments({ isUsed: false });
    
    // ৪. সাইজ ব্রেকডাউন (শুধুমাত্র যারা নিয়েছে তাদের)
    const sizeStats = await Ticket.aggregate([
      { $match: { isUsed: true } },
      { $group: { _id: '$tShirtSize', count: { $sum: 1 } } }
    ]);
    
    const sizeBreakdown = sizeStats.reduce((acc, curr) => {
        if(curr._id) acc[curr._id] = curr.count;
        return acc;
    }, {});

    return NextResponse.json({
      history,
      pagination: {
        totalDocs,
        limit,
        page,
        totalPages: Math.ceil(totalDocs / limit)
      },
      stats: {
        distributedCount: totalDistributed,
        pendingCount: totalPending,
        sizes: sizeBreakdown
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}