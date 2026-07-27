# Ash Mobile (React Native CLI + TypeScript)

A React Native (bare CLI, **not Expo**) mobile client for the Ash Transportation
challan management system, matching `ash-backend` / `ash-website` feature-for-feature:

- Login (email/password, remember me, auto token refresh)
- Dashboard (today/monthly/yearly trip stats, recent challans, latest activity)
- Add Challan (auto-generated challan number/date/time)
- Challans list (search, duration filters, infinite scroll)
- Challan detail (edit truck/place/date/time, soft-delete with a required reason)
- Receipt preview + native print/share (matches the physical NTPC consignment pad)
- Reports (filtered list + CSV / Excel / PDF export via the native share sheet)
- Settings (company info, printer preferences, profile, sign out)
- Audit logs

## Why no `android/` or `ios/` folder here

This project was generated in a sandboxed environment with **no network access**,
so the native Android/iOS project scaffolding (which `react-native init` normally
downloads from npm) could not be created here. Everything under `src/`, plus
`App.tsx`, `index.js`, `package.json`, `babel.config.js`, `metro.config.js`,
`tsconfig.json`, and `react-native.config.js` is complete and ready to drop into
a freshly scaffolded RN project.

### One-time setup (on your machine, with network access)

```bash
# 1. Scaffold a throwaway RN CLI + TypeScript project to get native folders
npx @react-native-community/cli@latest init AshMobileScaffold --version 0.86.0

# 2. Copy the generated native projects into this folder
cp -R AshMobileScaffold/android  ash-mobile/
cp -R AshMobileScaffold/ios      ash-mobile/

# 3. Remove the throwaway project
rm -rf AshMobileScaffold

# 4. Install dependencies (this repo's package.json already lists everything needed)
cd ash-mobile
npm install

# 5. iOS only — install CocoaPods
cd ios && pod install && cd ..

# 6. Run it
npm run android   # or: npm run ios
```

If you'd rather use `react-native init` directly instead of the community CLI,
that works identically — either way you just need *a* set of native `android/`
and `ios/` folders for RN 0.86.x, since the JS/TS side here is 100% complete.

> **Note on React's version:** RN 0.86 embeds a React Native renderer that must
> match your installed `react` version *exactly* (not just satisfy the semver
> range) — a known npm peer-dependency quirk. If `npm install` pulls a patch of
> React that doesn't match, either let the scaffold step above dictate the exact
> `react` version and copy it into this `package.json`, or run `npx react-native
> doctor` after install to catch the mismatch early.

## Pointing the app at your backend

Edit `src/config.ts`:

```ts
export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api/v1`   // 10.0.2.2 for Android emulator, localhost for iOS simulator
  : 'https://api.your-ash-domain.com/api/v1'; // your deployed ash-backend URL
```

For a physical device in dev mode, replace `DEV_HOST` with your computer's LAN IP
(e.g. `192.168.1.50`) since `localhost`/`10.0.2.2` only work for simulators/emulators.

## Native modules used (require linking — autolinked on RN CLI)

| Package | Purpose |
|---|---|
| `@react-native-async-storage/async-storage` | Persisting access/refresh tokens |
| `@react-navigation/*` + `react-native-screens` + `react-native-safe-area-context` | Navigation (stack + bottom tabs) |
| `react-native-fs` | Downloading exported CSV/Excel/PDF files |
| `react-native-share` | Opening the native share sheet for exports |
| `react-native-print` | Printing/sharing the delivery receipt as a PDF |
| `@react-native-picker/picker`, `@react-native-community/datetimepicker` | Available for future form pickers |

After `npm install`, iOS needs `pod install` (see above). Android autolinks on build.

## Project structure

```
App.tsx                     Root component (providers + navigator)
index.js                    RN entry point (AppRegistry)
src/
  api/                      axios client + one module per backend resource
  components/               Reusable UI primitives (Card, Field, Buttons, etc.)
  context/AuthContext.tsx   Auth state, mirrors ash-website's AuthContext
  navigation/                Root stack + bottom tabs, typed param lists
  screens/                  One screen per app section
  theme/theme.ts            Colors/spacing/typography matching ash-website's MUI theme
  types/index.ts            Shared TS types matching the NestJS schemas/DTOs
  utils/receiptHtml.ts       HTML template used for printing the receipt
```

## API parity with `ash-website`

Every mobile API call hits the exact same `ash-backend` endpoints the website
uses (`/auth/login`, `/challans`, `/dashboard`, `/export/*`, `/settings`,
`/audit-logs`, etc.) with the same request/response shapes — no backend changes
are required to use this app alongside the existing website.
