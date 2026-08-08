import { useState } from 'react';

export const NavBar = ({ user, setUser, onOpenAuth }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('skillmax_token');
    localStorage.removeItem('skillmax_user');
    if (setUser) setUser(null);
    setShowDropdown(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 transition-all duration-300">
      <a 
        href="#home" 
        className="group flex items-center gap-2 focus:outline-none"
      >
        <span className="logo font-logo text-3xl md:text-4xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-200 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-300 inline-block">
          SkillMax
        </span>
      </a>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              if (user) {
                setShowDropdown(!showDropdown);
              } else if (onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="group p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 focus:outline-none active:scale-95 flex items-center justify-center cursor-pointer"
            title={user ? user.name : "Profile / Log In"}
            aria-label="User Profile"
          >
            <svg 
              width="26" 
              height="26" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors duration-300"
            >
              <path 
                d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.72 11.28 8.72 9.50998C8.72 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z" 
                className={`${user ? 'stroke-amber-400' : 'stroke-gray-200'} group-hover:stroke-amber-400 transition-colors duration-300`} 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <path 
                d="M18.74 19.38C16.96 21.01 14.6 22 12 22C9.4 22 7.04 21.01 5.26 19.38C5.36 18.44 5.96 17.52 7.03 16.8C9.77 14.98 14.25 14.98 16.97 16.8C18.04 17.52 18.64 18.44 18.74 19.38Z" 
                className={`${user ? 'stroke-amber-400' : 'stroke-gray-200'} group-hover:stroke-amber-400 transition-colors duration-300`} 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <path 
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                className={`${user ? 'stroke-amber-400/80' : 'stroke-gray-300/60'} group-hover:stroke-amber-400/80 transition-colors duration-300`} 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Dropdown Menu when Logged In */}
          {user && showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-800 text-xs">
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-zinc-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-1 text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};