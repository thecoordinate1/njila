
// This file is no longer needed as its functionality has been merged into /src/app/page.tsx
// You can safely delete this file from your project.
// To prevent build errors if it's still imported somewhere (though it shouldn't be),
// we'll leave a minimal component here, but it should be removed.

'use client';
import type { NextPage } from 'next';
import Link from 'next/link';

const ObsoletePage: NextPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>This page is no longer in use.</h1>
      <p>The active delivery route functionality has been integrated into the Home page.</p>
      <Link href="/">Go to Home</Link>
    </div>
  );
};

export default ObsoletePage;
    