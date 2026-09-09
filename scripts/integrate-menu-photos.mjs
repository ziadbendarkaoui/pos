import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve(import.meta.dirname, '..');
const menuFile = path.join(projectRoot, 'src', 'data', 'menuData.ts');
const researchFile = 'C:\\Users\\asus\\Documents\\Codex\\2026-09-05\\deep-research-plugin-deep-research-work\\outputs\\photos-menu-tasty-pizza.html';
const activeDir = path.join(projectRoot, 'public', 'assets', 'menu');
const backupDir = 'C:\\Users\\asus\\Desktop\\disc\\tastypizza\\photos-menu-actuelles';

const decodeHtml = (value) => value
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const normalize = (value) => decodeHtml(value).normalize('NFKC').trim().toLocaleLowerCase('fr');
const safeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const menuSource = await fs.readFile(menuFile, 'utf8');
const html = await fs.readFile(researchFile, 'utf8');
const menuItemsSource = menuSource.slice(menuSource.indexOf('export const MENU_ITEMS'));
const products = [...menuItemsSource.matchAll(/\n  \{\n([\s\S]*?)\n  \},/g)].map((match) => {
  const block = match[0];
  return {
    id: block.match(/\n\s+id: '([^']+)'/)?.[1],
    name: block.match(/\n\s+nameFr: '([^']+)'/)?.[1],
    image: block.match(/\n\s+image: '([^']+)'/)?.[1],
  };
}).filter((item) => item.id && item.name && item.image);

const glovoByName = new Map();
for (const article of html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)) {
  const body = article[1];
  const name = body.match(/<h2>([\s\S]*?)<\/h2>/)?.[1];
  const image = body.match(/<img[^>]+src='([^']+)'/)?.[1];
  if (name && image) glovoByName.set(normalize(name), decodeHtml(image));
}

await fs.mkdir(activeDir, { recursive: true });
await fs.mkdir(backupDir, { recursive: true });

async function download(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 TastyPizzaPhotoImporter/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer).metadata();
  return { buffer, contentType: response.headers.get('content-type') ?? '' };
}

const manifest = [];
const failures = [];
for (const [index, product] of products.entries()) {
  const backupBase = `${product.id}-originale`;
  let current;
  try {
    current = await download(product.image);
    const extension = current.contentType.includes('png') ? 'png' : current.contentType.includes('webp') ? 'webp' : 'jpg';
    await fs.writeFile(path.join(backupDir, `${backupBase}.${extension}`), current.buffer);
  } catch (error) {
    failures.push({ id: product.id, source: 'current', url: product.image, error: String(error) });
  }

  const glovoUrl = glovoByName.get(normalize(product.name));
  let active = current?.buffer;
  let sourceType = 'current';
  if (glovoUrl) {
    try {
      active = (await download(glovoUrl)).buffer;
      sourceType = 'glovo';
    } catch (error) {
      failures.push({ id: product.id, source: 'glovo', url: glovoUrl, error: String(error) });
    }
  }
  if (!active) {
    active = Buffer.from(`<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="800" fill="#151515"/><circle cx="400" cy="330" r="150" fill="#c81024"/><path d="M400 205C340 295 305 360 305 420a95 95 0 00190 0c0-60-35-125-95-215z" fill="#ffd800"/><text x="400" y="610" text-anchor="middle" fill="#fff" font-family="Arial" font-size="42" font-weight="700">${safeXml(product.name)}</text><text x="400" y="665" text-anchor="middle" fill="#aaa" font-family="Arial" font-size="25">Tasty Pizza</text></svg>`);
    sourceType = 'placeholder';
  }

  const activeName = `${product.id}.webp`;
  await sharp(active).rotate().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(activeDir, activeName));
  manifest.push({
    id: product.id,
    name: product.name,
    previousUrl: product.image,
    matchedGlovoUrl: glovoUrl ?? null,
    activeSource: sourceType,
    activeFile: `/assets/menu/${activeName}`,
    order: index + 1,
  });
}

let updatedMenu = menuSource;
for (const product of manifest) {
  const idMarker = `id: '${product.id}'`;
  const start = updatedMenu.indexOf(idMarker);
  const end = updatedMenu.indexOf('\n  },', start);
  if (start < 0 || end < 0) throw new Error(`Bloc introuvable: ${product.id}`);
  const block = updatedMenu.slice(start, end);
  const updatedBlock = block.replace(/image: '[^']+'/, `image: '${product.activeFile}'`);
  updatedMenu = updatedMenu.slice(0, start) + updatedBlock + updatedMenu.slice(end);
}
await fs.writeFile(menuFile, updatedMenu, 'utf8');
await fs.writeFile(path.join(backupDir, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), products: manifest, failures }, null, 2), 'utf8');

const columns = 4;
const cardWidth = 220;
const cardHeight = 250;
const rows = Math.ceil(manifest.length / columns);
const composites = [];
for (let index = 0; index < manifest.length; index++) {
  const product = manifest[index];
  const thumb = await sharp(path.join(activeDir, `${product.id}.webp`)).resize(200, 190, { fit: 'cover' }).toBuffer();
  const label = Buffer.from(`<svg width="200" height="45"><rect width="200" height="45" fill="#191919"/><text x="10" y="18" fill="#fff" font-family="Arial" font-size="12" font-weight="700">${safeXml(product.name.slice(0, 27))}</text><text x="10" y="36" fill="${product.activeSource === 'glovo' ? '#ffd800' : '#aaa'}" font-family="Arial" font-size="10">${product.activeSource === 'glovo' ? 'Photo Glovo' : 'Photo actuelle conservée'}</text></svg>`);
  const x = (index % columns) * cardWidth + 10;
  const y = Math.floor(index / columns) * cardHeight + 10;
  composites.push({ input: thumb, left: x, top: y }, { input: label, left: x, top: y + 190 });
}
await sharp({ create: { width: columns * cardWidth, height: rows * cardHeight, channels: 3, background: '#0b0b0b' } })
  .composite(composites).jpeg({ quality: 86 }).toFile(path.join(backupDir, 'planche-contact-photos-actives.jpg'));

console.log(JSON.stringify({ total: manifest.length, glovo: manifest.filter((item) => item.activeSource === 'glovo').length, current: manifest.filter((item) => item.activeSource === 'current').length, failures }, null, 2));
