import { seed } from './data.js';

// Firestore de mentira: un Map de ruta → datos, con avisos a los suscriptores.
const store = seed();
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
if (typeof window !== 'undefined') window.__mockStore = store;

function snapOf(path) {
  const data = store.get(path);
  const id = path.split('/').pop();
  return {
    id,
    ref: { type: 'doc', path, id },
    exists: () => data !== undefined,
    data: () => (data === undefined ? undefined : structuredClone(data)),
  };
}

function docsOf(q) {
  const prefix = `${q.name}/`;
  let docs = [...store.keys()].filter((k) => k.startsWith(prefix)).map(snapOf);
  for (const c of q.cons || []) {
    if (c.op !== 'where') continue;
    docs = docs.filter((d) => {
      const v = d.data()[c.field];
      if (c.cmp === '==') return v === c.value;
      if (c.cmp === 'array-contains') return Array.isArray(v) && v.includes(c.value);
      throw new Error(`[mock] operador no soportado: ${c.cmp}`);
    });
  }
  return docs;
}

export function getFirestore() {
  return {};
}
export function collection(_db, name) {
  return { type: 'col', name };
}
export function doc(_db, ...segs) {
  return { type: 'doc', path: segs.join('/'), id: segs[segs.length - 1] };
}
export function orderBy() {
  return { op: 'orderBy' };
}
export function where(field, cmp, value) {
  return { op: 'where', field, cmp, value };
}
export function query(col, ...cons) {
  return { ...col, cons };
}
export function onSnapshot(q, cb) {
  const fn = () => cb({ docs: docsOf(q), size: docsOf(q).length });
  listeners.add(fn);
  setTimeout(fn, 0);
  return () => listeners.delete(fn);
}
export async function getDocs(q) {
  const docs = docsOf(q);
  return { docs, size: docs.length };
}
export async function getDoc(r) {
  return snapOf(r.path);
}
function write(path, data, merge) {
  store.set(path, merge ? { ...(store.get(path) || {}), ...data } : data);
}
export async function setDoc(r, data, opts) {
  write(r.path, structuredClone(data), opts?.merge);
  notify();
}
export async function updateDoc(r, data) {
  write(r.path, structuredClone(data), true);
  notify();
}
export async function deleteDoc(r) {
  store.delete(r.path);
  notify();
}
export async function addDoc(col, data) {
  const id = `n${Math.random().toString(36).slice(2, 10)}`;
  write(`${col.name}/${id}`, structuredClone(data), false);
  notify();
  return { id };
}
export function writeBatch() {
  const ops = [];
  return {
    update: (r, data) => ops.push(() => write(r.path, structuredClone(data), true)),
    set: (r, data) => ops.push(() => write(r.path, structuredClone(data), false)),
    delete: (r) => ops.push(() => store.delete(r.path)),
    commit: async () => {
      if (ops.length > 500) throw new Error('[mock] un lote admite 500 escrituras como máximo');
      ops.forEach((op) => op());
      notify();
    },
  };
}
