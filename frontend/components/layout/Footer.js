export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-gray-200/50 dark:border-neutral-800/50">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} ZestQuiz. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 