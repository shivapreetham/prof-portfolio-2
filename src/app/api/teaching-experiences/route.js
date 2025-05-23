import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import { TeachingExperience } from '@/models/models';

const HARDCODED_USER_ID = "67ed468b5b281d81f91a0a78";

// GET - Fetch all teaching experiences for the user
export async function GET() {
  try {
    await connectDB();
    const experiences = await TeachingExperience.find({ userId: HARDCODED_USER_ID }).sort({ startDate: -1 });
    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Error fetching teaching experiences:', error);
    return NextResponse.json({ message: 'Failed to fetch teaching experiences' }, { status: 500 });
  }
}

// POST - Create a new teaching experience
export async function POST(request) {
  try {
    const data = await request.json();
    const { subject, institution, startDate, endDate } = data;

    if (!subject || !institution || !startDate) {
      return NextResponse.json({ message: 'Subject, institution, and start date are required' }, { status: 400 });
    }

    await connectDB();
    const newExperience = new TeachingExperience({
      userId: HARDCODED_USER_ID,
      subject,
      institution,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      createdAt: new Date()
    });
    await newExperience.save();
    return NextResponse.json({ message: 'Teaching experience created successfully', id: newExperience._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating teaching experience:', error);
    return NextResponse.json({ message: 'Failed to create teaching experience' }, { status: 500 });
  }
}
