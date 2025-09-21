import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

async function verifyAdmin(idToken: string): Promise<string | null> {
  try {
    const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`;

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken,
      }),
    });

    if (!verifyResponse.ok) {
      return null;
    }

    const verifyData = await verifyResponse.json();
    const userEmail = verifyData.users[0]?.email;

    return userEmail === 'contact@smaaks.fr' ? userEmail : null;
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the Firebase ID token from Authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];

    // Verify admin status
    const adminEmail = await verifyAdmin(idToken);
    if (!adminEmail) {
      return NextResponse.json({ error: 'Access denied - Admin only' }, { status: 403 });
    }

    // Return admin access confirmation
    // Note: In a production environment, you would fetch the actual data from Firebase Admin SDK here
    // For now, we'll return placeholder data since client will fetch from Firestore
    const stats = {
      totalGroups: 0,
      totalMembers: 0,
      totalPosts: 0,
      pendingRequests: 0,
      reports: 0,
      activeGroups: 0,
      recentActivity: []
    };

    return NextResponse.json({
      stats,
      recentGroups: [],
      isAdmin: true,
      message: 'Admin verified - client should fetch data securely'
    });

  } catch (error) {
    console.error('Admin data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}