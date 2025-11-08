'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { getFirebaseDatabase } from '@/lib/firebase';
import { Session, User, Car } from '@/lib/types';

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showCreateCar, setShowCreateCar] = useState(false);
  const [carCapacity, setCarCapacity] = useState('4');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setSessionId(p.id));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const database = getFirebaseDatabase();
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSession({
          id: sessionId,
          createdAt: data.createdAt,
          users: data.users || {},
          cars: data.cars || {},
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const handleLogin = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    const database = getFirebaseDatabase();
    const userId = generateUserId();
    const newUser: User = {
      id: userId,
      name: name.trim(),
      password: password || undefined,
    };

    const userRef = ref(database, `sessions/${sessionId}/users/${userId}`);
    await set(userRef, newUser);
    
    setCurrentUser(newUser);
    setShowLogin(false);
  };

  const handleCreateCar = async () => {
    if (!currentUser) return;

    const database = getFirebaseDatabase();
    const capacity = parseInt(carCapacity);
    if (isNaN(capacity) || capacity < 1) {
      alert('Please enter a valid capacity');
      return;
    }

    const carId = generateCarId();
    const newCar: Car = {
      id: carId,
      driverId: currentUser.id,
      driverName: currentUser.name,
      capacity,
      passengers: [],
      createdAt: Date.now(),
    };

    const carRef = ref(database, `sessions/${sessionId}/cars/${carId}`);
    await set(carRef, newCar);
    
    setShowCreateCar(false);
    setCarCapacity('4');
  };

  const handleJoinCar = async (carId: string) => {
    if (!currentUser || !session) return;

    const database = getFirebaseDatabase();
    const car = session.cars[carId];
    if (!car) return;

    // Check if user is already in a car
    const userInCar = Object.values(session.cars).find(
      c => c.driverId === currentUser.id || c.passengers.includes(currentUser.id)
    );

    if (userInCar) {
      alert('You are already in a car. Leave your current car first.');
      return;
    }

    // Check capacity
    if (car.passengers.length >= car.capacity - 1) {
      alert('This car is full');
      return;
    }

    const updatedPassengers = [...car.passengers, currentUser.id];
    const carRef = ref(database, `sessions/${sessionId}/cars/${carId}/passengers`);
    await set(carRef, updatedPassengers);
  };

  const handleLeaveCar = async (carId: string) => {
    if (!currentUser || !session) return;

    const database = getFirebaseDatabase();
    const car = session.cars[carId];
    if (!car) return;

    if (car.driverId === currentUser.id) {
      // Driver leaving - delete the car
      const carRef = ref(database, `sessions/${sessionId}/cars/${carId}`);
      await set(carRef, null);
    } else {
      // Passenger leaving
      const updatedPassengers = car.passengers.filter(id => id !== currentUser.id);
      const carRef = ref(database, `sessions/${sessionId}/cars/${carId}/passengers`);
      await set(carRef, updatedPassengers);
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Session not found</h1>
          <p className="text-gray-600">This session may not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">Join Session</h1>
          <p className="text-gray-600 mb-8 text-center">Enter your name to get started</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password (optional)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Optional password"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cars = Object.values(session.cars);
  const users = session.users;
  const currentUserCar = currentUser ? cars.find(
    c => c.driverId === currentUser.id || c.passengers.includes(currentUser.id)
  ) : undefined;

  if (!currentUser) {
    return null; // This should never happen since we check showLogin above
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Carpooling Session</h1>
          <p className="text-gray-600 mb-4">Welcome, {currentUser.name}!</p>
          <button
            onClick={copyLink}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            📋 Copy Link to Share
          </button>
        </div>

        <div className="mb-8">
          {!currentUserCar && !showCreateCar && (
            <button
              onClick={() => setShowCreateCar(true)}
              className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              🚗 Create a Car
            </button>
          )}

          {showCreateCar && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Car</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (including driver)
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    value={carCapacity}
                    onChange={(e) => setCarCapacity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCar}
                    className="px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateCar(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Available Cars</h2>
          
          {cars.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">No cars yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cars.map((car) => {
                const isDriver = car.driverId === currentUser.id;
                const isPassenger = car.passengers.includes(currentUser.id);
                const isInCar = isDriver || isPassenger;
                const availableSpots = car.capacity - 1 - car.passengers.length;
                const isFull = availableSpots <= 0;

                return (
                  <div
                    key={car.id}
                    className={`bg-white p-6 rounded-lg border-2 ${
                      isInCar ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          🚗 {car.driverName}&apos;s Car
                        </h3>
                        <p className="text-sm text-gray-600">
                          Capacity: {car.capacity} ({availableSpots} spot{availableSpots !== 1 ? 's' : ''} available)
                        </p>
                      </div>
                      {isInCar && (
                        <button
                          onClick={() => handleLeaveCar(car.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Leave Car
                        </button>
                      )}
                      {!isInCar && !currentUserCar && !isFull && (
                        <button
                          onClick={() => handleJoinCar(car.id)}
                          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Join as Passenger
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Driver:</span>
                        <span className="text-sm text-gray-900">{car.driverName}</span>
                        {isDriver && <span className="text-sm text-gray-500">(you)</span>}
                      </div>

                      {car.passengers.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Passengers:</span>
                          <div className="mt-1 space-y-1">
                            {car.passengers.map((passengerId) => {
                              const passenger = users[passengerId];
                              if (!passenger) return null;
                              return (
                                <div key={passengerId} className="text-sm text-gray-900 ml-4">
                                  • {passenger.name}
                                  {passengerId === currentUser.id && (
                                    <span className="text-gray-500"> (you)</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function generateCarId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}
