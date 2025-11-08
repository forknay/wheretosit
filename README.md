# WhereToSit

**WhenToMeet, but for carpooling** 🚗

A simple, clean web app for coordinating carpooling sessions with friends. Create a session, share the link, and let everyone choose their ride!

## Features

- 🎯 **Simple Sessions**: Create carpooling sessions with a single click
- 📅 **Event Scheduling**: Optionally set event date/time with automatic session deletion
- 👤 **Easy Login**: Join with just your name (optional password)
- 🚗 **Drive or Ride**: Create a car as a driver or join as a passenger
- 👥 **Real-time Updates**: See who's driving and who's riding instantly
- 🔗 **Shareable Links**: Share session links with your group
- 🎨 **Clean UI**: Minimalist design inspired by OpenAI's interface
- ⏰ **Auto-Cleanup**: Sessions automatically delete after the event date passes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase account with a Realtime Database

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Create a Realtime Database:
   - Go to Build > Realtime Database
   - Click "Create Database"
   - Choose a location
   - Start in **test mode** (or configure security rules as needed)

3. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" and click the web icon (`</>`)
   - Register your app
   - Copy the configuration values

4. Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

5. Fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## How to Use

### Creating a Session

**Option 1: Quick Create (no event date)**
1. Click "Create New Session" on the home page
2. Share the generated link with your friends

**Option 2: Create with Event Date**
1. Click "Create with Event Date" on the home page
2. Select the event date and optionally the time
3. Click "Create Session"
4. The session will automatically delete after the event date passes
5. Share the generated link with your friends

### Joining a Session

1. Open the session link
2. Enter your name (and optional password)
3. Click "Join"

### Creating a Car (Driver)

1. Click "Create a Car"
2. Enter the total capacity (including yourself)
3. Click "Create"

### Joining a Car (Passenger)

1. Browse available cars in the session
2. Click "Join as Passenger" on your preferred car
3. You'll see yourself listed under passengers

### Leaving a Car

- Click "Leave Car" to remove yourself from a car
- If you're the driver, the car will be deleted

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Deployment**: Vercel (recommended)

## Database Structure

```typescript
sessions/
  {sessionId}/
    createdAt: number
    eventDate?: number // Optional: timestamp of event, session auto-deletes after this
    users/
      {userId}/
        id: string
        name: string
        password?: string
    cars/
      {carId}/
        id: string
        driverId: string
        driverName: string
        capacity: number
        passengers: string[]
        createdAt: number
```

## Security Considerations

- The app currently uses Firebase Realtime Database in test mode
- For production, configure proper Firebase security rules
- Consider adding authentication for sensitive use cases
- Session IDs are generated using cryptographically secure random methods (crypto.randomUUID)
- Sessions with event dates automatically delete after the event passes
- Expired sessions are immediately removed when accessed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
