'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';

const GroupChat = dynamic(() => import('@/components/GroupChat'), { ssr: false });

export default function GroupChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <GroupChat groupId={resolvedParams.id} />;
}