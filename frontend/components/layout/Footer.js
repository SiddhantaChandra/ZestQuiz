export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-gray-200/50 dark:border-neutral-800/50">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} ZestQuiz. Built by Siddhanta Chandra.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-2 text-sm">
          <a
            href="https://github.com/SiddhantaChandra/ZestQuiz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub Repo
          </a>
          <span className="hidden md:inline-block mx-2">|</span>
          <a
            href="https://www.sydcodes.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            www.sydcodes.dev
          </a>
        </div>
      </div>
    </footer>
  );
} 