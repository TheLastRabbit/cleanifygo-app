# CleanifyGo iOS App Knowledge Guide

This document explains:
- what was set up and fixed in this project
- what each important component and route does
- how Expo, Expo Router, and EAS Build work together
- common build errors and how to resolve them

---

## 1. What was done in this project

### iOS and EAS setup completed
- Added EAS configuration in eas.json
- Connected the project to Expo account/project using Expo EAS project ID
- Configured App Store Connect API settings in EAS submit profile
- Added iOS export compliance flag in app.json:
  - ios.infoPlist.ITSAppUsesNonExemptEncryption = false

### Security and credentials handling
- App Store private key is stored locally under .credentials/appstore
- .credentials is ignored in git so private keys are not committed

### Build failure fix implemented
- Fixed iOS Bundle JavaScript phase failure caused by duplicated TabLayout declaration
- Removed duplicated template block in app/(tabs)/_layout.tsx

Root cause that was fixed:
- Duplicate function declaration in app/(tabs)/_layout.tsx:
  - Identifier TabLayout has already been declared

---

## 2. High-level app architecture

The app uses:
- Expo SDK 54
- Expo Router for file-based navigation
- React Native UI screens
- SecureStore for local session token storage
- Remote API at https://api.cleanifygo.com

Main flow:
1. User opens app
2. Root layout loads fonts and auth state
3. If no session -> redirect to login
4. If logged in -> tabs flow (Jobs, Messages, Profile)

---

## 3. Routing and layout files

### app/_layout.tsx
Purpose:
- Root app shell
- Loads fonts and controls splash screen hide timing
- Wraps app in AuthProvider
- Defines top-level stack routes: (tabs) and (auth)
- Redirects unauthenticated users to /(auth)/login

Why this matters:
- This file is the gatekeeper for auth and navigation bootstrapping.

### app/(auth)/_layout.tsx
Purpose:
- Auth-only stack container
- Contains login and register screens
- Hides default headers for clean auth UI

### app/(tabs)/_layout.tsx
Purpose:
- Bottom tab navigator configuration
- Defines tabs: jobs, messages, profile
- Sets tab styles and icons

Important note:
- This file previously had duplicate code from template + custom implementation.
- The duplicate was removed to fix the iOS JS bundling failure.

### app/+not-found.tsx
Purpose:
- Fallback screen if route does not exist

### app/+html.tsx
Purpose:
- Web-specific HTML shell customization (only relevant for web export)

---

## 4. Auth screens

### app/(auth)/login.tsx
Purpose:
- Handles user sign-in UI
- Calls signIn from auth context
- On success, routes to /(tabs)/jobs

Key behavior:
- Normalizes email to lowercase
- Shows loading and API errors

### app/(auth)/register.tsx
Purpose:
- Handles account creation UI
- Captures name, email, password, and role (customer/cleaner)
- Calls signUp from auth context
- On success, routes to /(tabs)/jobs

---

## 5. Main app tabs

### app/(tabs)/jobs.tsx
Purpose:
- Lists marketplace jobs
- Supports pull-to-refresh
- Cleaner users can claim open jobs

Data calls:
- fetchJobs
- claimJob

### app/(tabs)/messages.tsx
Purpose:
- Lists conversations
- Displays unread counts and last message preview
- Opens conversation detail screen

Data call:
- fetchConversations

### app/conversation/[id].tsx
Purpose:
- Conversation detail/chat screen
- Loads messages for one conversation
- Sends new messages
- Scrolls to latest message

Data calls:
- fetchMessages
- sendMessage

### app/(tabs)/profile.tsx
Purpose:
- Displays signed-in user profile summary
- Displays role-dependent details (for cleaner fields)
- Allows sign out

Current TODO stubs:
- Edit Profile action
- Manage Subscription action

---

## 6. State and data layer

### lib/auth.tsx
Purpose:
- Auth context provider and hook
- Stores current session in React state
- Exposes signIn, signUp, signOut, updateSession

### lib/api.ts
Purpose:
- API client wrapper around marketplace endpoints
- Stores session securely in Expo SecureStore
- Auto-refreshes access token on 401
- Central place for auth/jobs/profile/messages requests

Important constants:
- API_URL is currently hardcoded to https://api.cleanifygo.com

### types/marketplace.ts
Purpose:
- Shared TS contracts for roles, jobs, conversations, sessions, messages, profile, and auth payloads

---

## 7. Expo and EAS concepts explained

### Expo (runtime and developer tooling)
Expo is the framework/runtime layer used to build the React Native app quickly.

It gives you:
- Expo SDK packages (secure-store, splash, fonts, etc.)
- Metro bundling
- easy local run commands (expo start, expo start --ios)

### Expo Router (navigation)
Expo Router maps files and folders under app/ to routes automatically.

Examples:
- app/(auth)/login.tsx -> /(auth)/login
- app/(tabs)/jobs.tsx -> /(tabs)/jobs
- app/conversation/[id].tsx -> dynamic route with id param

### EAS Build (cloud native builds)
EAS Build compiles your app in Expo cloud infrastructure (Mac builders for iOS).

It handles:
- native build environment
- credentials integration
- app signing
- build artifacts for TestFlight/App Store submission

### EAS Submit (delivery to App Store Connect)
Submit profile in eas.json tells EAS how to talk to App Store Connect.

Uses:
- API key file path
- API key ID
- issuer ID
- Apple team ID

### app.json vs eas.json
- app.json: app runtime configuration (bundle id, plugins, splash, infoPlist, etc.)
- eas.json: build and submit pipeline configuration (profiles, version behavior, submit auth)

---

## 8. Build process checklist

Use this order for reliable iOS releases:

1. Ensure Expo login is valid
2. Ensure app is linked to EAS project
3. Ensure iOS credentials are available (distribution certificate + provisioning profile)
4. Run production iOS build
5. If build succeeds, run submit

Suggested commands:
- npx eas-cli@latest whoami
- npx eas-cli@latest build -p ios --profile production
- npx eas-cli@latest submit -p ios --profile production

---

## 9. Common errors and fixes

### Error: Run this command inside a project directory
Fix:
- run command from cleanifygo-app root

### Error: Credentials are not set up (non-interactive)
Fix:
- run interactive build once to generate/validate certs

### Error: Unknown error in Bundle JavaScript phase
Fix strategy:
1. Reproduce locally:
   - npx expo export --platform ios
2. Read concrete source error and line
3. Fix TS/JS route/component issue
4. Retry EAS build

### Warning: app.json missing ITSAppUsesNonExemptEncryption
Fix:
- set ios.infoPlist.ITSAppUsesNonExemptEncryption to false (already applied)

---

## 10. Current project status

- EAS project is linked
- iOS credentials exist in Expo remote credentials storage
- App Store Connect API submit config is in place
- JS bundling conflict fixed
- App is ready for repeat iOS production build attempts

---

## 11. Recommended next improvements

1. Move API_URL into environment config per build profile
2. Implement Profile edit and subscription management screens
3. Add stronger form validation on login/register
4. Add error boundary + toast system for API failures
5. Add E2E smoke tests for auth + jobs + messaging flows
