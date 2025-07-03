'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Predefined positions for decorative elements
const DECORATIVE_ELEMENTS = [
  { type: 'circle', top: 15, left: 25, size: 8, delay: 0, color: 'bg-blue-400/30' },
  { type: 'square', top: 45, left: 75, size: 12, delay: 0.2, color: 'bg-purple-400/30' },
  { type: 'dot', top: 75, left: 35, size: 4, delay: 0.4, color: 'bg-white' },
  { type: 'circle', top: 25, left: 85, size: 6, delay: 0.6, color: 'bg-indigo-400/30' },
  { type: 'square', top: 65, left: 15, size: 10, delay: 0.8, color: 'bg-violet-400/30' },
  { type: 'dot', top: 85, left: 65, size: 3, delay: 1, color: 'bg-white' },
  { type: 'circle', top: 35, left: 45, size: 7, delay: 1.2, color: 'bg-blue-400/30' },
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
      className={`bg-gradient-to-br from-primary via-purple-600 to-indigo-600 dark:from-primary dark:via-purple-700 dark:to-indigo-700 rounded-lg overflow-hidden relative transition-all duration-500 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {DECORATIVE_ELEMENTS.map((element, i) => (
          <div
            key={i}
            className={`absolute ${element.color} animate-float`}
            style={{
              top: `${element.top}%`,
              left: `${element.left}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              animationDelay: `${element.delay}s`,
              borderRadius: element.type === 'circle' ? '50%' : element.type === 'dot' ? '50%' : '4px',
              transform: `rotate(${element.delay * 45}deg)`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      <div className="flex justify-between items-center p-8 relative z-10">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-4xl text-white mb-2 font-bold relative inline-block">
            {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Welcome to ZestQuiz!'}
          </h1>
          
          <p className="text-white/90 mb-6 text-lg max-w-md relative">
            {user
              ? "Let's continue with today's quiz!"
              : 'Join us to start your learning journey with interactive quizzes!'}
            <span className="absolute -left-4 top-1/2 w-2 h-2 bg-white/50 rounded-full animate-ping" />
          </p>
          
          {!user && (
            <button 
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative group overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
            </button>
          )}
        </div>

        <div 
          className={`relative transition-all duration-700 delay-300 ${
            mounted ? 'translate-x-0 opacity-100 rotate-0' : 'translate-x-4 opacity-0 rotate-3'
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
            
            {/* Enhanced glow effect */}
            <div 
              className={`absolute inset-0 bg-white/20 blur-3xl rounded-full transition-all duration-1000 ${
                imageLoaded ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
              style={{
                animation: imageLoaded ? 'glow 4s ease-in-out infinite' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { transform: scale(1); opacity: 0.3; filter: blur(20px); }
          50% { transform: scale(1.2); opacity: 0.5; filter: blur(25px); }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
} 