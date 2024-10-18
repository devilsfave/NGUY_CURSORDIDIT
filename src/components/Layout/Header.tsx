import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ButtonStyling from '../ButtonStyling';

interface User {
  uid: string;
  displayName?: string;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const router = useRouter();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Education', path: '/education' },
  ];

  return (
    <header className="bg-[#171B26] text-[#EFEFED] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold">DermaVision</a>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`hover:text-blue-400 ${router.pathname === item.path ? 'text-blue-400' : ''}`}>
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <a className="hover:text-blue-400">
                  {user.displayName || 'Profile'}
                </a>
              </Link>
              <ButtonStyling text="Logout" onClick={onLogout} />
            </div>
          ) : (
            <div className="space-x-2">
              <ButtonStyling text="Login" onClick={() => router.push('/login')} />
              <ButtonStyling text="Sign Up" onClick={() => router.push('/signup')} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

