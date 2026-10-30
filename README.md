# ClutchMetrics Mobile

**ClutchMetrics Mobile** is a React Native application designed to complement the ClutchMetrics web platform, bringing gaming highlights, player discovery, community interactions, and account management to mobile devices.

The application connects to a shared Java Spring Boot REST API and PostgreSQL database, allowing users to access the same account and community data across the web and mobile platforms.

## Technologies

- React Native 0.86
- React 19
- Expo SDK 57
- TypeScript 6
- React Navigation 7
- Expo SecureStore
- Expo Video
- Expo Image Picker

**Backend:** Java Spring Boot REST API  
**Database:** PostgreSQL

## Main Features

### Authentication and Account Security

- User registration with email verification
- Login and logout
- JWT-based authentication with access and refresh tokens
- Secure token storage using Expo SecureStore
- Forgot password functionality
- Password changes with email confirmation

### Gaming Feed

- Browse community gaming highlights
- Search and filter clips by game
- Watch videos using Expo Video
- Like and unlike clips
- View, add, and manage comments
- Share highlights using native device sharing options
- Report inappropriate content

Video playback uses an on-demand loading approach to reduce memory consumption and improve stability.

### Discover Players

- Discover registered players
- View public player profiles
- Follow and unfollow users
- View followers and following lists
- Access linked social media profiles
- Open published highlights directly in the Feed

### Premium Subscriptions

- View the current subscription plan
- Compare Free and Premium benefits
- Switch between subscription plans for demonstration purposes
- Synchronize subscription changes with the web platform

**Note:** Premium benefits are currently available through ClutchMetrics Web. The mobile application supports subscription management but does not yet offer mobile-exclusive Premium features.

Real payment processing is not implemented.

### Profile Management

- View account information
- Update display name and biography
- View, upload, or remove profile pictures
- Change password through email confirmation
- Log out securely

Profile changes are synchronized with the ClutchMetrics web platform.

## Supported Games

- League of Legends
- Valorant
- Counter-Strike 2

## Getting Started

### Prerequisites

- Node.js and npm
- Android Studio with a configured Android emulator
- ClutchMetrics Spring Boot backend running locally
- PostgreSQL database configured for the backend
- Mailpit for testing email verification and password recovery

### Installation

Clone the mobile repository and install the dependencies:

```bash
git clone https://github.com/AndreMiguelAlves/clutchmetrics-mobile.git
cd clutchmetrics-mobile
npm install
```


### Backend Configuration

The application currently uses the following API address for the Android emulator:

```text
http://10.0.2.2:8080
```

The address `10.0.2.2` allows the Android emulator to communicate with the Spring Boot backend running on the host computer.

Make sure the backend is available on port `8080` before launching the mobile application.

This address is intended for local Android emulator development. Other devices or environments require an appropriate API configuration.

### Running the Application

Start the Expo development server:

```bash
npx expo start -c
```

Once Expo is running, press `a` in the terminal to launch the Android emulator.

Alternatively, use the configured npm script:

```bash
npm run android
```

## Project Architecture

ClutchMetrics follows a shared-backend architecture:

```text
ClutchMetrics Web (Next.js)
           |
           |
ClutchMetrics Mobile (React Native)
           |
           v
    Spring Boot REST API
           |
           v
       PostgreSQL
```

Both applications communicate with the same backend, sharing authentication, player profiles, subscriptions, clips, and community interactions.

## Current Limitations and Future Improvements

The following features are not fully implemented in the current mobile version:

- Automatic thumbnail generation for individual videos
- Automatic video playback while scrolling through the Feed
- Push notifications
- Direct video publishing to TikTok, Instagram, and YouTube Shorts
- Mobile-exclusive Premium benefits
- Real subscription payments and automatic billing
- Camera capture and advanced avatar cropping
- Biometric authentication

The avatar gallery upload feature also requires further validation on a physical device.

These improvements are planned as potential future developments.

## Project Context

ClutchMetrics was developed as a final academic project for the **Técnico/a Especialista em Tecnologias e Programação de Sistemas de Informação (TPSI)** course.

The project includes three main components:

- **Backend:** Java Spring Boot
- **Web:** Next.js
- **Mobile:** React Native and Expo

The goal is to combine gaming performance analysis, video content management, and community interaction within a connected platform.

## Author

André Miguel Nunes Alves

**ClutchMetrics — Your Game. Your Data. Your Edge.**