// Datos de ejemplo para la vista previa. Nada de esto es real.
const tones = ['#C1B6A8', '#8A8378', '#4D4B46', '#D9D2C9', '#A89F92', '#6B665E', '#E4DED6'];

function picture(i, w, h) {
  const a = tones[i % tones.length];
  const b = tones[(i * 3 + 2) % tones.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<rect x="${w * 0.12}" y="${h * 0.55}" width="${w * 0.76}" height="${h * 0.3}" fill="#F3F2EF" opacity="0.55"/>` +
    `<rect x="${w * 0.12}" y="${h * 0.18}" width="${w * 0.3}" height="${h * 0.28}" fill="#1C1C1A" opacity="0.25"/>` +
    `<text x="${w - 16}" y="${h - 16}" text-anchor="end" font-family="sans-serif" font-size="${h * 0.09}" fill="#1C1C1A" opacity="0.5">${i + 1}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const projects = [
  ['Poniente Villa 95', 'Familia Ortega'],
  ['Sierra Blanca 12', 'M. Lindqvist'],
  ['La Zagaleta 7', 'Hartmann'],
  ['Guadalmina Baja', 'Señora Peña'],
  ['Ático Puerto Banús', ''],
  ['', ''],
];
const tagSets = [
  ['Isla', 'BLUN', 'Roble'],
  ['Lineal', 'Hettich', 'Blanco'],
  ['Isla', 'Hettich', 'Negro'],
  ['Península', 'BLUN'],
  ['Isla', 'Roble', 'Encimera porcelánica'],
  [],
];

export function seed() {
  const store = new Map();
  const day = 86400000;
  const now = Date.now();

  store.set('settings/categories', {
    list: [
      { name: 'Distribución', tags: ['Península', 'Isla', 'Lineal', 'En L'] },
      { name: 'Herrajes', tags: ['Hettich', 'BLUN', 'Grass'] },
      { name: 'Acabado', tags: ['Roble', 'Negro', 'Blanco', 'Nogal', 'Lacado mate', 'Encimera porcelánica'] },
      { name: 'Electrodomésticos', tags: ['Miele', 'Gaggenau', 'Bora', 'V-Zug', 'Sub-Zero', 'Liebherr', 'Siemens', 'Neff'] },
    ],
  });
  store.set('settings/studio', { name: 'Nosh Studio', logoUrl: '' });
  store.set('users/demo', { email: 'demo@noshstudio.test', displayName: 'Demo' });

  for (let i = 0; i < 46; i++) {
    const [projectName, clientName] = projects[i % projects.length];
    const hasOriginal = i % 4 !== 3;
    store.set(`photos/p${i}`, {
      url: picture(i, 1600, 1200),
      thumbnailUrl: picture(i, 400, 300),
      originalUrl: hasOriginal ? picture(i, 1600, 1200) : undefined,
      storagePath: `photos/p${i}.jpg`,
      thumbnailPath: `thumbnails/p${i}.jpg`,
      originalPath: hasOriginal ? `originals/p${i}.jpg` : undefined,
      originalName: `cocina-${i + 1}.jpg`,
      originalSize: 9_400_000 + i * 310_000,
      projectName,
      clientName,
      tags: tagSets[(i * 5 + 1) % tagSets.length],
      featured: i % 9 === 0,
      deleted: false,
      createdAt: new Date(now - i * day).toISOString(),
    });
  }
  // Papelera: una reciente y otra caducada (debe desaparecer sola al entrar).
  store.set('photos/trash-recent', {
    url: picture(60, 1600, 1200), thumbnailUrl: picture(60, 400, 300),
    storagePath: 'photos/t1.jpg', thumbnailPath: 'thumbnails/t1.jpg', originalPath: 'originals/t1.jpg',
    projectName: 'Borrada hace 3 días', tags: ['BLUN'], deleted: true,
    deletedAt: new Date(now - 3 * day).toISOString(), createdAt: new Date(now - 90 * day).toISOString(),
  });
  store.set('photos/trash-expired', {
    url: picture(61, 1600, 1200), thumbnailUrl: picture(61, 400, 300),
    storagePath: 'photos/t2.jpg', thumbnailPath: 'thumbnails/t2.jpg', originalPath: 'originals/t2.jpg',
    projectName: 'Borrada hace 40 días', tags: [], deleted: true,
    deletedAt: new Date(now - 40 * day).toISOString(), createdAt: new Date(now - 120 * day).toISOString(),
  });
  return store;
}
