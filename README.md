# Cuaderno — cómo publicar tu app (sin saber programar)

Tu clave de Anthropic **NO** va dentro de estos archivos. Se agrega directamente
en Vercel en el paso 4, y ahí queda protegida.

## Paso 1 — Subir estos archivos a GitHub

1. Entra a https://github.com y crea un repositorio nuevo (botón verde "New").
   Ponle de nombre, por ejemplo, `cuaderno-app`. Déjalo público o privado, como prefieras.
2. En la página del repositorio recién creado, busca el enlace que dice
   **"uploading an existing file"**.
3. Arrastra ahí TODOS los archivos y carpetas que te compartí (manteniendo la
   estructura: la carpeta `api`, la carpeta `src`, `index.html`, `package.json`, etc.)
4. Dale clic a "Commit changes" (puedes dejar el mensaje que aparece por defecto).

## Paso 2 — Conectar con Vercel

1. Entra a https://vercel.com y crea una cuenta usando el botón
   **"Continue with GitHub"** (así quedan conectados automáticamente).
2. Haz clic en **"Add New… → Project"**.
3. Busca el repositorio `cuaderno-app` que acabas de subir y dale **"Import"**.
4. Vercel va a detectar que es un proyecto de Vite automáticamente. No cambies nada.

## Paso 3 — Agregar tu clave de API (el paso importante)

1. Antes de darle a "Deploy", busca la sección **"Environment Variables"**.
2. En el campo de nombre escribe: `ANTHROPIC_API_KEY`
3. En el campo de valor pega la clave que ya creaste en console.anthropic.com.
4. Dale clic en "Add" y luego en **"Deploy"**.

## Paso 4 — Listo

En 1-2 minutos Vercel te dará un enlace como `cuaderno-app.vercel.app`.
Esa es tu app, publicada y funcionando, que puedes compartir con quien quieras.

---

### Si algo falla
- Si el sitio carga pero las preguntas no responden: revisa que
  `ANTHROPIC_API_KEY` esté bien escrita en Vercel (Settings → Environment
  Variables) y vuelve a hacer un "Redeploy".
- Si necesitas hacer algún cambio de diseño o de texto más adelante, tráeme
  la petición aquí y te preparo los archivos actualizados para volver a subir.
