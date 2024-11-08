import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db }from '../../../Firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'appointment' | 'analysis' | 'system';
  message: string;
  createdAt: Date;
  read: boolean;
  userId: string;
}

interface DashboardNotificationsProps {
  userId: string;
  role: 'patient' | 'doctor' | 'admin';
}

export const DashboardNotifications: React.FC<DashboardNotificationsProps> = ({ userId, role }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Notification[];
      
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-[#374151] transition-colors"
      >
        <FiBell className="w-6 h-6 text-[#9C9FA4]" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-[#262A36] rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#EFEFED] font-semibold">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#9C9FA4] hover:text-[#EFEFED]"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-[#171B26] rounded-lg"
                    >
                      <p className="text-[#EFEFED] text-sm">{notification.message}</p>
                      <p className="text-[#9C9FA4] text-xs mt-1">
                        {notification.createdAt.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[#9C9FA4] text-center">No new notifications</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};