'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set } from 'firebase/database';
import { getFirebaseDatabase } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createSession = async () => {
    setCreating(true);
    try {
      const database = getFirebaseDatabase();
      const sessionId = generateSessionId();
      const sessionRef = ref(database, `sessions/${sessionId}`);
      
      await set(sessionRef, {
        createdAt: Date.now(),
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

        <button
          onClick={createSession}
          disabled={creating}
          className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create New Session'}
        </button>

        <p className="text-sm text-gray-500 max-w-md text-center">
          Create a session to organize carpooling with your friends. 
          Share the link and let everyone choose their ride!
        </p>
      </main>
    </div>
  );
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15);
}
