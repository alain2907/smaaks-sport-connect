import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { groupId, userId, reason, details, userInfo } = await request.json();

    // Validate required fields
    if (!groupId || !userId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get group information
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (!groupDoc.exists()) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const groupData = groupDoc.data();
    const timestamp = new Date();

    // Save report to Firestore
    const reportData = {
      groupId,
      groupName: groupData.name,
      groupOrganizerId: groupData.organizer.uid,
      groupOrganizerName: groupData.organizer.name,
      reportedBy: userId,
      reporterInfo: userInfo,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const reportRef = await addDoc(collection(db, 'reports'), reportData);

    // Create notification for group administrator
    const notificationData = {
      userId: groupData.organizer.uid,
      type: 'group_reported',
      title: 'Signalement de votre groupe',
      message: `Votre groupe "${groupData.name}" a été signalé pour: ${reason}`,
      data: {
        groupId,
        groupName: groupData.name,
        reportId: reportRef.id,
        reason
      },
      isRead: false,
      createdAt: timestamp
    };

    await addDoc(collection(db, 'notifications'), notificationData);

    // Prepare email content
    const emailData = {
      to: 'contact@smaaks.fr',
      subject: `[SIGNALEMENT] Groupe "${groupData.name}"`,
      html: `
        <h2>Nouveau signalement reçu</h2>
        <p><strong>Groupe signalé:</strong> ${groupData.name}</p>
        <p><strong>ID du groupe:</strong> ${groupId}</p>
        <p><strong>Organisateur du groupe:</strong> ${groupData.organizer.name}</p>
        <p><strong>Signalé par:</strong> ${userInfo.name} (${userInfo.email})</p>
        <p><strong>Motif:</strong> ${reason}</p>
        <p><strong>Détails:</strong> ${details || 'Aucun détail fourni'}</p>
        <p><strong>Date:</strong> ${timestamp.toLocaleString('fr-FR')}</p>
        <p><strong>ID du signalement:</strong> ${reportRef.id}</p>

        <hr>
        <p>Accédez au <a href="${process.env.NEXT_PUBLIC_APP_URL}/groups/${groupId}">groupe signalé</a></p>
      `
    };

    // Send email (you'll need to implement this based on your email service)
    // For now, we'll use a simple fetch to a mail service or log it
    console.log('Email to send:', emailData);

    // If you have an email service like Resend, SendGrid, etc., call it here
    // await sendEmail(emailData);

    return NextResponse.json({
      success: true,
      message: 'Signalement envoyé avec succès',
      reportId: reportRef.id
    });

  } catch (error) {
    console.error('Error processing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}