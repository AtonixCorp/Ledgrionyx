# Ledgrionyx Mobile iOS

Native React Native iOS client for the Ledgrionyx platform. This app mirrors the current web hierarchy: login to console, select an organization, view the organization dashboard, and inspect business suites.

## Stack

- React Native 0.76.1
- TypeScript
- React Navigation
- AsyncStorage
- Axios
- Native iOS project scaffolded with XcodeGen and CocoaPods

## Local setup

1. Install dependencies:

```bash
cd mobile-ios
npm install
```

2. Generate the iOS project:

```bash
brew install xcodegen
npm run generate:ios
```

3. Install CocoaPods:

```bash
npm run pods
```

4. Start Metro:

```bash
npm run start
```

5. Run the iOS simulator build:

```bash
npm run ios
```

## Backend endpoint

The development API root is currently hardcoded in `src/services/api.ts` as `http://127.0.0.1:8000`. For simulator access, keep the Django API running on the host machine.