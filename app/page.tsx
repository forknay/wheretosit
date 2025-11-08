'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set } from 'firebase/database';
import { getFirebaseDatabase } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const createSession = async (withDate: boolean = false) => {
    setCreating(true);
    try {
      const database = getFirebaseDatabase();
      const sessionId = generateSessionId();
      const sessionRef = ref(database, `sessions/${sessionId}`);
      
      let eventDateTime: number | undefined;
      if (withDate && eventDate) {
        const dateTimeString = eventTime 
          ? `${eventDate}T${eventTime}` 
          : `${eventDate}T23:59`;
        eventDateTime = new Date(dateTimeString).getTime();
      }
      
      await set(sessionRef, {
        createdAt: Date.now(),
        eventDate: eventDateTime,
        users: {},
        cars: {},
      });

      router.push(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please check your Firebase configuration.');
      setCreating(false);
    }
  };

  const handleQuickCreate = () => {
    createSession(false);
  };

  const handleCreateWithDate = () => {
    if (!eventDate) {
      alert('Please select an event date');
      return;
    }
    createSession(true);
  };

  if (showDatePicker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Set Event Date
            </h1>
            <p className="text-gray-600">
              Session will auto-delete after this date
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-1">
                Event Time (optional)
              </label>
              <input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreateWithDate}
                disabled={creating}
                className="flex-1 px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Session'}
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                disabled={creating}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-gray-900 mb-3">
            WhereToSit
          </h1>
          <p className="text-lg text-gray-600">
            WhenToMeet, but for carpooling
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleQuickCreate}
            disabled={creating}
            className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create New Session'}
          </button>
          
          <button
            onClick={() => setShowDatePicker(true)}
            disabled={creating}
            className="px-6 py-3 bg-white border-2 border-black text-black rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Create with Event Date
          </button>
        </div>

        <p className="text-sm text-gray-500 max-w-md text-center">
          Create a session to organize carpooling with your friends. 
          Share the link and let everyone choose their ride!
        </p>
      </main>
    </div>
  );
}

function generateSessionId(): string {
  // Use crypto.randomUUID for secure random ID generation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 12);
  }
  // Fallback for environments without crypto.randomUUID
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(36)).join('').substring(0, 12);
}
