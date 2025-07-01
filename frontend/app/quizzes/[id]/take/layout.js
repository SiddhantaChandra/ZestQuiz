import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Take Quiz - ZestQuiz'
};

// This tells Next.js to use this layout instead of the root layout
export const dynamic = 'force-dynamic';

export default function QuizTakeLayout({ children }) {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </div>
  );
} 