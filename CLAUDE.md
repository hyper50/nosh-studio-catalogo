# Nosh Studio — Portfolio

Aplicación interna de Nosh Studio (estudio de cocinas a medida, Marbella) para guardar las fotos de sus proyectos, etiquetarlas y enseñarlas a clientes. La usa un equipo pequeño: se gestiona sobre todo desde ordenador y se presenta en ordenador, tablet o la pantalla del estudio.

- Producción: https://nosh-studio-catalogo.vercel.app
- Repo: `hyper50/nosh-studio-catalogo` (público). Vercel despliega solo con cada push a `main`.
- Firebase: proyecto `nosh-studio-catalogo`, plan Blaze.

Este proyecto se desarrolló en una conversación de Cowork y continúa aquí. Este documento recoge lo que esa conversación sabía y que el código no dice por sí solo.

## Con quién trabajas

Moisés Quiñones es el dueño del estudio. No es programador y no usa la terminal: describe lo que quiere y revisa el resultado en la app desplegada. Habla en español.

- Respuestas breves. Cuando hay una decisión, opciones concretas con una recomendación.
- Los cambios aprobados se suben directamente a `main`; no hace falta pedirle permiso para cada commit, pero dile siempre qué has subido y qué no has podido comprobar.
- Para cambios de diseño visibles, enséñale antes una propuesta y espera su visto bueno. Para arreglos y funciones que ya ha aprobado, hazlo.
- Deja pendiente lo que él diga que se deja pendiente. La lista está al final.
- No pidas ni manejes tokens o contraseñas en el chat.

## Cómo está montada

React 19 + Vite, sin router en uso (la navegación es un estado en `App.jsx`). Firebase Auth con email y contraseña, Firestore y Storage. Sin backend propio ni Cloud Functions. Los estilos son objetos en línea que salen de `src/styles/theme.js`; no hay CSS ni librería de componentes.

Hay tres vistas, elegidas desde el menú lateral:

- **Gestión** (`Management/`): subir, etiquetar, editar, borrar y reordenar fotos.
- **Presentación** (`Presentation/`): la misma galería sin controles de edición, para enseñar a clientes.
- **Ajustes** (`Settings/`): categorías y etiquetas, usuarios, perfil, papelera, datos del estudio.

Para arrancar en local hace falta un `.env` con las seis variables `VITE_FIREBASE_*` de `.env.example`. Los valores reales están en las variables de entorno de Vercel y en la consola de Firebase. `.env` está en `.gitignore` y debe seguir ahí.

```
npm install
npm run dev
npm run build   # comprobar siempre antes de subir
```

`npm run lint` da cuatro errores de imports sin usar en `ManagementView.jsx` que ya estaban; no son de tu cambio.

## Datos

**Firestore**

- `photos/{id}`: `url`, `thumbnailUrl`, `originalUrl`, `storagePath`, `thumbnailPath`, `originalPath`, `originalName`, `originalSize`, `projectName`, `clientName`, `tags` (lista de textos), `featured`, `deleted`, `deletedAt`, `order`, `uploadedBy`, `createdAt` (ISO).
- `settings/categories`: `{ list: [{ name, tags: [] }] }`. Las categorías son grupos de etiquetas editables desde Ajustes; `defaultCategories.js` solo se usa para crear el documento la primera vez.
- `settings/studio`: `{ name, logoUrl }`.
- `users/{uid}`: perfil, creado en el primer inicio de sesión.

**Storage**: `thumbnails/`, `photos/`, `originals/`, `studio/logo`.

Las reglas de Firestore y de Storage exigen usuario autenticado para leer y escribir. Storage limita a imágenes de hasta 15 MB, salvo `originals/`, que admite hasta 50 MB. Las reglas se editan a mano en la consola de Firebase; no están en el repo.

## Lo que no se ve leyendo el código

**Cada foto son tres archivos.** Al subir, el navegador genera una miniatura (400 px, para la cuadrícula) y una versión de pantalla (2560 px, 1,5 MB, para el visor y el editor), y sube además el original intacto para poder descargarlo. El original se sube con `Content-Disposition: attachment` para que el enlace lo descargue en vez de abrirlo. Las fotos anteriores a este cambio no tienen original: por eso el botón de descarga solo aparece si existe `originalUrl`. Cualquier código que borre una foto tiene que borrar los tres archivos.

**El orden es manual y compartido.** `src/utils/photoOrder.js` ordena por una clave numérica: el campo `order` si existe, o la fecha de subida en milisegundos si no. Clave más alta, más arriba. Así las fotos antiguas, que no tienen `order`, conservan su sitio sin migración. Arrastrar una foto en Gestión le asigna una clave a medio camino entre sus nuevas vecinas, con una sola escritura; si no queda hueco, se renumeran todas. Las tandas nuevas entran arriba en el orden en que se seleccionaron los archivos. El orden de Presentación es el mismo. El arrastre usa la API nativa de arrastrar y soltar, que no funciona en pantallas táctiles; se dejó así a propósito porque Gestión se usa en escritorio.

**Borrar es mover a la papelera.** `deleted: true` y `deletedAt`. Las vistas filtran las borradas en el cliente. La papelera muestra solo las de los últimos 30 días, pero nada las elimina de verdad pasado ese plazo: las más antiguas siguen en Firestore y en Storage sin verse. Arreglar esto es la primera tarea pendiente.

**`colors.white` no es blanco.** La app nació con tema oscuro y se pasó a claro cambiando los valores del tema. `colors.white` quedó como "color de énfasis" y vale negro cálido. En código nuevo usa `colors.text`, `colors.black` o `colors.paper`, que dicen lo que son. Sobre fondos oscuros (barra superior, visor a pantalla completa) el texto claro se escribe con `colors.navText` o `#F3F2EF`.

## Marca

La app sigue la identidad de Nosh Studio de 2026. Lo que aplica aquí:

- Cinco colores y ninguno más: negro cálido `#1C1C1A`, gris mineral `#4D4B46`, taupe `#8A8378`, piedra clara `#C1B6A8`, blanco roto `#F3F2EF`. Nunca negro puro ni grises fríos. El fondo es blanco roto; las superficies elevadas, blanco. Los únicos tonos fuera de la paleta son los de estado definidos en el tema (error, éxito, destacada).
- Tipografía IBM Plex Sans. Las etiquetas de formulario van en mayúsculas con espaciado abierto (`letterSpacing: '0.1em'`).
- Sin esquinas redondeadas (`radius` vale 0), salvo elementos circulares como avatares y casillas.
- El logotipo es el componente `Common/NoshWordmark.jsx`, el SVG oficial. No lo recrees con texto.
- Tono sobrio y con aire. Ante la duda, quita.
- El lema "Crafted with quiet precision." va en inglés y no se traduce.

Si Moisés tiene instalada la skill `ns-identidad-marca`, es la referencia completa.

## Estado al traspasar

Subido y desplegado: rediseño de marca, editor de foto en dos columnas, originales en alta calidad con descarga.

Hecho y pendiente de comprobar en la app real:

- **Reordenar arrastrando.** La lógica de `photoOrder.js` está probada aparte (mover arriba, abajo, a los extremos, con filtros, movimientos repetidos). El arrastre en el navegador no se ha probado con sesión iniciada. Comprueba que una foto movida se queda en su sitio tras recargar.
- **Subida con original.** Moisés actualizó las reglas de Storage pero aún no había subido una foto de prueba. Comprueba que la barra llega al final y que aparece "Descargar original" con el peso.

## Pendiente

Aprobado, por hacer:

1. **Borrado automático de la papelera a los 30 días.** Debe eliminar el documento y los tres archivos. Sin Cloud Functions, lo más simple es limpiar las caducadas cuando un usuario abre la app o la papelera; una función programada sería más fiable pero añade despliegue de backend. Propónle la opción antes de montar backend.

Aplazado por Moisés, no empezar sin que lo pida:

2. **Usuarios.** La pestaña de Ajustes no crea usuarios: solo muestra instrucciones para hacerlo en la consola de Firebase. Hay que implementarlo de verdad (requiere backend) o quitar el formulario.
3. **Proyecto y cliente son texto libre.** Un espacio de más crea un proyecto distinto. Autocompletar con los existentes o crear una colección `projects`.
4. **Modo Presentación.** Agrupar por proyecto, pase de diapositivas a pantalla completa y enlaces por proyecto que un cliente pueda abrir sin iniciar sesión.

Detalles menores: `public/vite.svg` sobra; `README.md` y `GUIA_DESPLIEGUE.md` son de la primera versión y pueden estar desfasados.
