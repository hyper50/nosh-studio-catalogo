# Nosh Studio — Guía de Despliegue

## 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (ej: "nosh-studio")
3. **Desactiva** Google Analytics (no lo necesitas)

### 1.1 Activar Authentication
1. En el menú lateral: **Build > Authentication**
2. Click en **Get started**
3. En **Sign-in method**, activa **Email/Password**
4. Crea tu primer usuario: **Users > Add user**
   - Email: tu email
   - Password: tu contraseña

### 1.2 Activar Firestore
1. En el menú lateral: **Build > Firestore Database**
2. Click en **Create database**
3. Selecciona **Start in test mode** (luego lo aseguramos)
4. Elige la región más cercana (ej: `europe-west1` para España)

### 1.3 Activar Storage
1. En el menú lateral: **Build > Storage**
2. Click en **Get started**
3. Selecciona **Start in test mode**

### 1.4 Obtener credenciales
1. Ve a **Project settings** (icono engranaje arriba a la izquierda)
2. Scroll abajo hasta **Your apps**
3. Click en el icono **Web** (</>)
4. Registra la app con nombre "nosh-studio-web"
5. Copia los valores de `firebaseConfig`

### 1.5 Cambiar a plan Blaze (cuando necesites más de 5GB)
1. En la consola de Firebase, click en **Upgrade** (abajo a la izquierda)
2. Selecciona plan **Blaze** (pay-as-you-go)
3. Asocia una tarjeta
4. Los primeros 5GB siguen siendo gratis

## 2. Configurar el proyecto

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Rellena `.env` con tus credenciales de Firebase:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=nosh-studio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nosh-studio
VITE_FIREBASE_STORAGE_BUCKET=nosh-studio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Probar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con el usuario que creaste en Firebase.

## 4. Reglas de seguridad en Firestore

Ve a **Firestore > Rules** y pega:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer y escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5. Reglas de seguridad en Storage

Ve a **Storage > Rules** y pega:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Desplegar en Vercel

### Opción A: Desde GitHub (recomendado)
1. Sube el proyecto a un repositorio en GitHub
2. Ve a [Vercel](https://vercel.com/) y haz login con GitHub
3. Click en **New Project** > importa el repositorio
4. En **Environment Variables**, añade TODAS las variables de `.env`
5. Click en **Deploy**

### Opción B: Desde terminal
```bash
npm install -g vercel
vercel login
vercel
```
Cuando te pregunte, acepta los defaults. Luego configura las variables de entorno en el dashboard de Vercel.

### IMPORTANTE: Variables de entorno en Vercel
En el dashboard de Vercel > tu proyecto > Settings > Environment Variables, añade:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 7. Configurar dominio personalizado (opcional)

En Vercel > tu proyecto > Settings > Domains, puedes añadir tu dominio personalizado (ej: `portfolio.noshstudio.com`).

## 8. Añadir nuevos empleados

1. Ve a Firebase Console > Authentication > Users > Add user
2. Introduce email y contraseña temporal
3. Comparte las credenciales con el empleado
4. El empleado inicia sesión y su perfil se crea automáticamente

---

## Resumen de costes estimados

| Servicio | Free tier | Coste estimado |
|----------|-----------|----------------|
| Firebase Auth | 50.000 usuarios/mes | Gratis |
| Firestore | 1 GB almacenamiento | Gratis |
| Firebase Storage | 5 GB | ~$1-2/mes (plan Blaze, >5GB) |
| Vercel | 100 GB bandwidth/mes | Gratis |
| **Total** | | **$0-2/mes** |
