import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { token, topic } = await req.json();

    if (!token || !topic) {
      return NextResponse.json({ error: 'Token ou topic manquant' }, { status: 400 });
    }

    // Utiliser Firebase Admin SDK pour se désabonner du topic
    await admin.messaging().unsubscribeFromTopic([token], topic);

    console.log(`❌ Token désabonné du topic: ${topic}`);
    return NextResponse.json({ success: true, topic });
  } catch (err: any) {
    console.error('Unsubscribe topic error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}