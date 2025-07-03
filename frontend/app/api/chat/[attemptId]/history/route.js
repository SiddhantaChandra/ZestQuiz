import { api } from '@/lib/api';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const attemptId = request.url.split('/chat/')[1].split('/history')[0];
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${attemptId}/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch chat history');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch chat history' },
      { status: error.status || 500 }
    );
  }
} 