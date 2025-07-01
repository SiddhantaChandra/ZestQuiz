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

    const response = await api.get(`/chat/${attemptId}/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to load chat history' },
      { status: error.response?.status || 500 }
    );
  }
} 