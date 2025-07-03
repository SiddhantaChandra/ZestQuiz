'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Predefined star positions for better performance
const STAR_POSITIONS = [
  { top: 15, left: 25, delay: 0 },
  { top: 45, left: 75, delay: 0.2 },
  { top: 75, left: 35, delay: 0.4 },
  { top: 25, left: 85, delay: 0.6 },
  { top: 65, left: 15, delay: 0.8 }
];

export default function AnimatedHeroBanner({ user }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <div 
      className={`bg-primary dark:bg-primary rounded-lg overflow-hidden relative transition-opacity duration-500 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STAR_POSITIONS.map((position, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse-star"
            style={{
              top: `${position.top}%`,
              left: `${position.left}%`,
              animationDelay: `${position.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center p-8 relative z-10">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-4xl text-white mb-4 font-bold">
            {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Welcome to ZestQuiz!'}
          </h1>
          
          <p className="text-white/90 mb-6 text-lg">
            {user
              ? "Let's continue with today's quiz!"
              : 'Join us to start your learning journey with interactive quizzes!'}
          </p>
          
          {!user && (
            <button 
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          )}
        </div>

        <div 
          className={`relative transition-all duration-700 delay-300 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <div className="relative">
            <Image 
              src="/Hero_art.webp" 
              alt="Quiz" 
              width={400} 
              height={200}
              className={`h-full w-auto relative z-10 transition-all duration-500 ${
                imageLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              style={{ maxHeight: '200px' }}
              priority
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Glow effect */}
            <div 
              className={`absolute inset-0 bg-white/10 blur-2xl rounded-full transition-opacity duration-1000 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                animation: imageLoaded ? 'glow 3s ease-in-out infinite' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }

        @keyframes pulse-star {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-pulse-star {
          animation: pulse-star 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 