import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/assess', label: 'Assessment' },
  { path: '/results', label: 'Results' },
  { path: '/portfolio', label: 'Portfolio' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-[#F81894] text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight hover:opacity-90">
            Risky<span className="text-[#FF66B2]">FRISKY</span>
          </Link>
          <nav className="flex gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-white text-[#F81894]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          RiskyFRISKY — Personalized financial decision support powered by AI.
          <br />
          Not financial advice. For educational and demonstration purposes only.
        </div>
      </footer>
    </div>
  );
}
