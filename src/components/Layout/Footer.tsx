import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#171B26] text-[#EFEFED] p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Link href="/">
            <a className="text-xl font-bold">DermaVision</a>
          </Link>
          <p className="text-sm mt-2">© {currentYear} DermaVision. All rights reserved.</p>
        </div>
        <nav>
          <ul className="flex flex-wrap justify-center md:justify-end space-x-4">
            <li>
              <Link href="/about">
                <a className="hover:text-blue-400">About</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="hover:text-blue-400">Contact</a>
              </Link>
            </li>
            <li>
              <Link href="/app/Terms of Service/terms-of-service">
                <a className="hover:text-blue-400">Terms of Service</a>
              </Link>
            </li>
            <li>
              <Link href="/app/Privacy Policy/privacy-policy">
                <a className="hover:text-blue-400">Privacy Policy</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;