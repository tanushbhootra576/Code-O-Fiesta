'use client';

import React from 'react';
import CodingIDE from '@/components/ide/CodingIDE';

export default function Round2Page() {
  return (
    <CodingIDE
      problemId="prob-relay"
      roundNumber={2}
      mode="relay"
      roundConfig={{
        mode: 'relay',
        activeTeamMember: 'member1',
        currentUserId: 'member1',
        forceSwitchAfterMs: 600_000,
      }}
      onSolve={(subId) => console.log('Solved:', subId)}
    />
  );
}
