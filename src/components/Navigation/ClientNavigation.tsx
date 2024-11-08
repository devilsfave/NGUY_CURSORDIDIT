'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiUser, FiCalendar, FiActivity, FiClock, FiBook, FiPlus, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ClientNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getNavigationItems = () => {
    const roleBasedItems = {
      patient: [
        { 
          label: 'Dashboard',
          path: '/dashboard',
          icon: FiHome 
        },
        { 
          label: 'New Analysis', 
          path: '/analyses/new',
          icon: FiPlus 
        },
        { 
          label: 'Analysis History', 
          path: '/history',
          icon: FiActivity 
        },
        { 
          label: 'Education', 
          path: '/education',
          icon: FiBook 
        },
        { 
          label: 'Appointments', 
          path: '/appointments',
          icon: FiCalendar 
        },
      ],
      doctor: [
        { 
          label: 'Dashboard', 
          path: '/doctor/dashboard',
          icon: FiHome 
        },
        { 
          label: 'Appointments', 
          path: '/appointments',
          icon: FiCalendar 
        },
        { 
          label: 'Patient Records', 
          path: '/dashboard/patient-records',
          icon: FiUser 
        },
        { 
          label: 'Analysis History', 
          path: '/analyses/doctor',
          icon: FiActivity 
        },
        { 
          label: 'Availability', 
          path: '/doctor/availability',
          icon: FiClock 
        },
      ],
      admin: [
        { 
          label: 'Dashboard',
          path: '/dashboard',
          icon: FiHome 
        },
        { 
          label: 'New Analysis', 
          path: '/analyses/new',
          icon: FiPlus 
        },
        { 
          label: 'Analysis History', 
          path: '/history',
          icon: FiActivity 
        }
      ]
    };

    const items = [
      ...(roleBasedItems[user?.role || 'patient'] || []),
      { 
        label: 'Profile', 
        path: '/profile',
        icon: FiUser 
      }
    ];

    return items;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActiveLink = (path: string) => pathname === path;

  return (
    <nav className="bg-[#171B26] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#EFEFED]">
          DermaVision
        </Link>

        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-[#EFEFED] focus:outline-none"
          >
            <motion.svg 
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </motion.svg>
          </button>
        </div>

        <AnimatePresence>
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:flex md:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-16 md:top-0 left-0 md:left-auto w-full md:w-auto bg-[#171B26] md:bg-transparent p-4 md:p-0 z-50`}
          >
            {user ? (
              <>
                {getNavigationItems().map((item) => (
                  <motion.li 
                    key={item.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href={item.path} 
                      className={`flex items-center ${
                        isActiveLink(item.path) 
                          ? 'text-[#3B82F6] font-semibold' 
                          : 'text-[#EFEFED] hover:text-[#3B82F6]'
                      } mb-2 md:mb-0 px-2 py-1 rounded transition-colors`}
                    >
                      <item.icon className="mr-2" />
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center text-[#EFEFED] hover:text-[#3B82F6] mb-2 md:mb-0 px-2 py-1 rounded transition-colors"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </button>
                </motion.li>
              </>
            ) : (
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/auth" 
                  className="flex items-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded transition-colors"
                >
                  Sign In
                </Link>
              </motion.li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default ClientNavigation;
