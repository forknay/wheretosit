export interface User {
  name: string;
  password?: string;
  id: string;
}

export interface Car {
  id: string;
  driverId: string;
  driverName: string;
  capacity: number;
  passengers: string[]; // Array of user IDs
  createdAt: number;
}

export interface Session {
  id: string;
  createdAt: number;
  eventDate?: number; // Optional: Date/time of the event
  users: { [userId: string]: User };
  cars: { [carId: string]: Car };
}
