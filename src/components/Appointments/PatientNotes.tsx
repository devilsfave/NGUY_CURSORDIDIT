import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Modal from '../Modal/Modal';
import { auth, db }from '../../Firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import type { AppointmentStatus } from '../../types/appointment';
import ButtonStyling from '../ButtonStyling';
import { toast } from 'react-toastify';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  authorName: string;
}

interface PatientNotesProps {
  appointmentId?: string;
  patientId: string;
  doctorId?: string;
  onClose?: () => void;
  isDoctor: boolean;
  readOnly?: boolean;
  appointmentStatus?: AppointmentStatus;
  isOpen: boolean;
}

const PatientNotes: React.FC<PatientNotesProps> = ({
  appointmentId,
  patientId,
  doctorId,
  onClose,
  isDoctor,
  readOnly = false,
  appointmentStatus,
  isOpen
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!appointmentId) return;
      
      try {
        const notesRef = collection(db, `appointments/${appointmentId}/notes`);
        const notesSnap = await getDocs(notesRef);
        const fetchedNotes = notesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Note));
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [appointmentId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !appointmentId) return;

    try {
      const notesRef = collection(db, `appointments/${appointmentId}/notes`);
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
      const userName = userDoc.data()?.name || 'Unknown User';

      await addDoc(notesRef, {
        content: newNote,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        authorName: isDoctor ? `Dr. ${userName}` : userName,
        type: isDoctor ? 'doctor' : 'patient'
      });

      setNewNote('');
      // Refresh notes
      const updatedNotesSnap = await getDocs(notesRef);
      const updatedNotes = updatedNotesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Note));
      setNotes(updatedNotes);
      
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose ?? (() => {})}
      title="Appointment Notes"
    >
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading notes...</p>
        ) : notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{note.authorName}</span>
                  <span>{note.createdAt.toLocaleString()}</span>
                </div>
                <p className="mt-2 text-white">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No notes yet</p>
        )}

        {!readOnly && (
          <div className="mt-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              placeholder="Add a note..."
              rows={3}
            />
            <ButtonStyling
              text="Add Note"
              onClick={handleAddNote}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PatientNotes;