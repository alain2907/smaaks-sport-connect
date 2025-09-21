# Smaaks Groups - Next.js Firebase Vercel App

A modern web application built with Next.js 15, Firebase Authentication, and server-side rendering, ready for deployment on Vercel.

## Features

- 🔐 **Firebase Authentication** - Email/password authentication with password reset
- ⚡ **Next.js 15 with App Router** - Latest Next.js features with server-side rendering
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 🚀 **Vercel Deployment** - Optimized for Vercel platform with environment variables
- 📱 **Responsive Design** - Mobile-friendly UI that works on all devices
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🔄 **Real-time Auth State** - React Context for auth state management
- 📲 **Android App (TWA)** - Native Android app available with deep linking support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
- Vercel account (optional, for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd smaaks-groups
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Authentication and select Email/Password provider
   - Get your configuration from Project Settings
   - Add the values to `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
smaaks-groups/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Sign up page
│   │   └── reset-password/# Password reset page
│   ├── dashboard/         # Protected dashboard
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Library configurations
│   ├── firebase.ts        # Firebase client config
│   └── firebase-admin.ts  # Firebase admin config
├── middleware.ts          # Next.js middleware for route protection
└── vercel.json           # Vercel deployment configuration
```

## Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`
4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Android App

The SMAAKS Groups Android app is built as a Trusted Web Activity (TWA) using Bubblewrap.

### Current Version
- **Version Name**: 1.5
- **Version Code**: 8
- **Package ID**: com.smaaks.groups1
- **Min SDK**: 21 (Android 5.0+)
- **Target SDK**: 35

### Available Files
- **Google Play Store**: `SMAAKS-Groups-v1.5-GooglePlay-VersionCode8.aab`
- **Direct Install APK**: `SMAAKS-Groups-v1.5-FINAL-VersionCode8.apk`

### Building the Android App

See [KEYSTORE.md](./KEYSTORE.md) for detailed instructions on building and signing the Android app.

## Firebase Setup Guide

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create Project"
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to Authentication
   - Click "Get Started"
   - Enable Email/Password provider

3. **Get Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web" icon to add a web app
   - Copy the configuration values

4. **Generate Service Account (for Admin SDK):**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Copy values to `.env.local`

## Security Notes

- Never commit `.env.local` to version control
- Keep your Firebase Admin private key secure
- Enable appropriate Firebase Security Rules
- Use environment variables for all sensitive data
- Enable CORS and configure allowed domains in Firebase

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.