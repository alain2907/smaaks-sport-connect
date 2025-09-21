import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/fcm-auth';

export async function POST(req: NextRequest) {
  try {
    const { topic, title, body } = await req.json();

    if (!topic || !title || !body) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // Obtenir un access token OAuth
    const accessToken = await getAccessToken();

    // Format pour l'API v1
    const message = {
      message: {
        topic: topic,
        notification: {
          title,
          body,
        },
        android: {
          notification: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          },
          fcm_options: {
            link: '/', // Redirection après clic
          },
        },
      },
    };

    const response = await fetch(
      'https://fcm.googleapis.com/v1/projects/smaaks-1/messages:send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FCM API Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, fcmResponse: data });
  } catch (err: any) {
    console.error('Send notification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}