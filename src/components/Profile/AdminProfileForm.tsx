import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../Firebase/config'; // Changed from firestore to db

interface AdminProfileFormProps {
  isEditing: boolean;
}

const AdminProfileForm: React.FC<AdminProfileFormProps> = ({ isEditing }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!user?.uid) return;

      try {
        const adminRef = doc(db, 'users', user.uid); // Changed from firestore to db
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          setFormData(prevData => ({
            ...prevData,
            fullName: adminData.fullName || user?.displayName || '',
            email: adminData.email || user?.email || '',
          }));
          setRole(adminData.role);
        } else {
          // If document doesn't exist, create it with default values
          const defaultData = {
            fullName: user.displayName || '',
            email: user.email || '',
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await setDoc(doc(db, 'users', user.uid), defaultData);
          setFormData({
            fullName: defaultData.fullName,
            email: defaultData.email,
          });
          setRole('admin');
        }
      } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred';
        console.error('Error fetching admin profile:', error);
        toast.error(`Failed to load profile data: ${errorMessage}`);
      }
    };

    fetchAdminProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const adminRef = doc(db, 'users', user.uid); // Changed from firestore to db
      await setDoc(adminRef, {
        ...formData,
        role: 'admin', // Ensure role is preserved
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      console.error('Error updating admin profile:', error);
      toast.error(`Failed to update profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm text-[#9C9FA4]">Full Name</label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 bg-[#262A36] border border-[#374151] rounded text-[#EFEFED] placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-[#9C9FA4]">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 bg-[#262A36] border border-[#374151] rounded text-[#EFEFED] placeholder-[#4B5563] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[#9C9FA4]">Role</label>
        <p className="text-[#EFEFED] p-2 bg-[#262A36] border border-[#374151] rounded">
          {role || 'Loading...'}
        </p>
      </div>

      {isEditing && (
        <button 
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      )}
    </form>
  );
};

export default AdminProfileForm;