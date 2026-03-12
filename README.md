# Ionic Starter App

![Ionic](https://img.shields.io/badge/Ionic-7.0-3880FF?style=flat-square&logo=ionic)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=flat-square&logo=angular)
![Capacitor](https://img.shields.io/badge/Capacitor-5.0-119EFF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Production-ready Ionic 7 starter with Capacitor, offline storage, push notifications, and native features.

## Features

- **Ionic 7** - Latest Ionic Framework
- **Angular 17** - Standalone components
- **Capacitor 5** - Native runtime
- **Offline First** - SQLite + sync
- **Push Notifications** - FCM integration
- **Biometrics** - Face ID / Fingerprint
- **Dark Mode** - System preference
- **i18n** - Multi-language

## Quick Start

```bash
# Install dependencies
npm install

# Run in browser
ionic serve

# Run on iOS
ionic cap run ios

# Run on Android
ionic cap run android
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Services, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/            # Shared components, pipes
│   │   ├── components/
│   │   └── pipes/
│   ├── features/          # Feature modules
│   │   ├── auth/
│   │   ├── home/
│   │   ├── profile/
│   │   └── settings/
│   └── app.routes.ts
├── assets/
├── environments/
└── theme/
    └── variables.scss
```

## Native Features

### Camera

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

async takePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });

  this.photoUrl = image.webPath;
}
```

### Biometric Auth

```typescript
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

async authenticate() {
  const result = await BiometricAuth.authenticate({
    reason: 'Please authenticate',
    cancelTitle: 'Cancel',
  });

  if (result.success) {
    // Authenticated
  }
}
```

### Push Notifications

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

async initPush() {
  await PushNotifications.requestPermissions();
  await PushNotifications.register();

  PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', action => {
    console.log('Push action:', action);
  });
}
```

### Offline Storage

```typescript
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage: Storage;

  async init() {
    this.storage = await this.storage.create();
  }

  async set(key: string, value: any) {
    await this.storage.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key);
  }
}
```

### Geolocation

```typescript
import { Geolocation } from '@capacitor/geolocation';

async getCurrentPosition() {
  const position = await Geolocation.getCurrentPosition();
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

watchPosition() {
  return Geolocation.watchPosition({}, (position) => {
    console.log('Position:', position);
  });
}
```

## Theme & Styling

### Dark Mode

```typescript
// Auto-detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
document.body.classList.toggle('dark', prefersDark.matches);

// Manual toggle
toggleDarkMode() {
  document.body.classList.toggle('dark');
}
```

### Custom Theme

```scss
// theme/variables.scss
:root {
  --ion-color-primary: #3880ff;
  --ion-color-secondary: #3dc2ff;
  --ion-color-tertiary: #5260ff;
}

.dark {
  --ion-color-primary: #428cff;
  --ion-background-color: #1e1e1e;
  --ion-text-color: #ffffff;
}
```

## Authentication

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);

  async login(email: string, password: string) {
    const response = await this.api.login({ email, password });
    await this.storage.set('token', response.token);
    this.user$.next(response.user);
  }

  async logout() {
    await this.storage.remove('token');
    this.user$.next(null);
    this.router.navigate(['/login']);
  }

  async checkAuth() {
    const token = await this.storage.get('token');
    if (token) {
      const user = await this.api.getProfile();
      this.user$.next(user);
    }
  }
}
```

## API Service

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }
}
```

## Build & Deploy

```bash
# Build web
ionic build --prod

# Build iOS
ionic cap build ios

# Build Android
ionic cap build android

# Sync native projects
ionic cap sync
```

## Environment Config

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  firebase: {
    projectId: 'your-project',
    // ...
  },
};
```

## License

MIT
