const user = { uid: 'demo', email: 'demo@noshstudio.test', displayName: 'Demo' };
const auth = { currentUser: user };

export function getAuth() {
  return auth;
}
export function onAuthStateChanged(_auth, cb) {
  setTimeout(() => cb(user), 0);
  return () => {};
}
export async function signInWithEmailAndPassword() {
  return { user };
}
export async function signOut() {}
export async function updatePassword() {}
export async function updateProfile() {}
