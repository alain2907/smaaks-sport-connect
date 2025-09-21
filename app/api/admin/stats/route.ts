import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // Import Firebase Admin dynamically to avoid build errors
    const { adminAuth, adminDb } = await import('@/lib/firebase-admin');

    // Get the Firebase ID token from Authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];

    try {
      // Verify the token with Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userUid = decodedToken.uid;

      // Get user data from Firestore to check role
      const userDoc = await adminDb.collection('users').doc(userUid).get();

      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userData = userDoc.data();
      const userRole = userData?.role;

      // Check if user has admin role
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Access denied - Admin role required' }, { status: 403 });
      }

      // If we get here, user is verified admin - fetch and return stats
      const [usersSnapshot, groupsSnapshot, requestsSnapshot] = await Promise.all([
        adminDb.collection('users').get(),
        adminDb.collection('groups').get(),
        adminDb.collection('membershipRequests').where('status', '==', 'pending').get()
      ]);

      const stats = {
        totalUsers: usersSnapshot.size,
        totalGroups: groupsSnapshot.size,
        pendingRequests: requestsSnapshot.size,
        totalPosts: 0, // Add when posts collection exists
        totalReports: 0 // Add when reports collection exists
      };

      return NextResponse.json({
        isAdmin: true,
        uid: userUid,
        role: userRole,
        stats,
        message: 'Admin access granted'
      });

    } catch (adminError) {
      console.error('Admin verification failed:', adminError);

      // Fallback: Check by email for backward compatibility
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
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const verifyData = await verifyResponse.json();
      const userEmail = verifyData.users[0]?.email;

      // Fallback check for specific admin email
      if (userEmail === 'contact@smaaks.fr') {
        return NextResponse.json({
          isAdmin: true,
          email: userEmail,
          message: 'Admin access granted (fallback)'
        });
      }

      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}