'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Card */}
      <div className="card p-8 mb-8 bg-primary">
        <h1 className="text-4xl text-white mb-4">
          {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Welcome to ZestQuiz!'}
        </h1>
        <p className="text-white/90 mb-6 text-lg">
          {user
            ? "Let's continue with today's quiz!"
            : 'Join us to start your learning journey with interactive quizzes!'}
        </p>
        <button className="btn-secondary">
          Let's go!
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {['All', 'Mathematics', 'Science', 'History', 'Geography', 'Technology'].map((category, index) => (
          <button
            key={category}
            className={`btn whitespace-nowrap ${
              index === 0 ? 'btn-primary' : 'btn-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="card p-6 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl mb-2">JavaScript Basics</h3>
                <p className="text-sm text-text/70">
                  Test your knowledge of JavaScript fundamentals
                </p>
              </div>
              <span className="bg-secondary px-2 py-1 rounded-custom-sm text-sm border border-black">
                15 Questions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {['JS', 'Coding', 'Web'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-background px-2 py-1 rounded-custom-sm text-xs border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="btn-primary">Start Quiz</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
