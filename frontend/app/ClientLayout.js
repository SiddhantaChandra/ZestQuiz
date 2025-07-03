'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }) {
  return (
    <body className={`${inter.className} bg-background dark:bg-background-dark min-h-screen`}>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster position="bottom-right" />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </body>
  );
} 