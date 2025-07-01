import { api } from '@/lib/api';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const attemptId = request.url.split('/chat/')[1].split('/messages')[0];
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const response = await api.post(`/chat/${attemptId}/messages`, body, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
} 