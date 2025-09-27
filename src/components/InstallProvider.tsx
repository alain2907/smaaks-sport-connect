'use client';

import { InstallBanner } from './InstallBanner';

export function InstallProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InstallBanner />
      {children}
    </>
  );
}