'use client';

import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Predefined star positions to avoid hydration mismatch
const STAR_POSITIONS = [
  { top: 15, left: 25 },
  { top: 45, left: 75 },
  { top: 75, left: 35 },
  { top: 25, left: 85 },
  { top: 65, left: 15 }
];

export default function AnimatedHeroBanner({ user }) {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Floating animation for the hero image
  const floatingAnimation = {
    y: [-10, 10],
    opacity: 1,
    transition: {
      opacity: {
        duration: 0.5
      },
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  // Stars animation
  const starVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0 // This will be overridden per star
      }
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        className="card px-8 py-4 mb-8 bg-primary overflow-hidden relative opacity-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {STAR_POSITIONS.map((position, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-0"
              style={{
                top: `${position.top}%`,
                left: `${position.left}%`,
              }}
              initial="initial"
              variants={{
                ...starVariants,
                animate: {
                  ...starVariants.animate,
                  transition: {
                    ...starVariants.animate.transition,
                    delay: i * 0.2
                  }
                }
              }}
              animate="animate"
            />
          ))}
        </div>

        <div className="flex justify-between items-center relative z-10">
          <motion.div variants={containerVariants}>
            <motion.h1 
              className="text-4xl text-white mb-4 font-bold opacity-0"
              variants={itemVariants}
            >
              {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Welcome to ZestQuiz!'}
            </motion.h1>
            
            <motion.p 
              className="text-white/90 mb-6 text-lg opacity-0"
              variants={itemVariants}
            >
              {user
                ? "Let's continue with today's quiz!"
                : 'Join us to start your learning journey with interactive quizzes!'}
            </motion.p>
            
            {!user && (
              <motion.button 
                className="btn-secondary hover:scale-105 transition-transform opacity-0"
                onClick={() => router.push('/auth/login')}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            )}
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={floatingAnimation}
          >
            <Image 
              src="/Hero_art.webp" 
              alt="Quiz" 
              width={400} 
              height={400} 
              className="h-full w-auto relative z-10"
              style={{ maxHeight: '200px' }}
              priority
            />
            
            {/* Glowing effect behind the image */}
            <motion.div
              className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </LazyMotion>
  );
} 