import { Suspense } from 'react';
import TakeQuizClient from './TakeQuizClient';

export default function TakeQuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TakeQuizClient />
    </Suspense>
  );
} 