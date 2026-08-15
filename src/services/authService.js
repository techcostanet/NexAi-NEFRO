import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const USERS_COLLECTION = "users";

// Contas pré-definidas do sistema para mapeamento de papéis e médicos
const KNOWN_ACCOUNTS = {
  "admin@nefroapp.com": { role: "admin", doctorId: null, nome: "Super Administrador" },
  "dr.marcelo@nefroapp.com": { role: "doctor", doctorId: "dr-marcelo", nome: "Dr. Marcelo Ramos" },
  "demo@nefroapp.com": { role: "doctor", doctorId: "dr-marcelo", nome: "Dr. Marcelo Ramos (Demo)" },
  "dra.gisele@nefroapp.com": { role: "doctor", doctorId: "dra-gisele", nome: "Dra. Gisele" }
};

/**
 * Autentica o usuário via Firebase Authentication e sincroniza seu papel no Firestore
 */
export async function loginWithFirebaseAuth(email, password) {
  if (!auth) throw new Error("Firebase Auth não inicializado");

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
  } catch (error) {
    // Se a conta de demonstração/médico ainda não foi criada no Firebase Auth do projeto, tenta provisionar
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
      try {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      } catch (createErr) {
        // Se já existe com outra senha ou falhou a criação direta, relança erro amigável
        throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
      }
    } else {
      throw error;
    }
  }

  const user = userCredential.user;
  
  // Sincroniza dados do usuário na coleção `users` do Firestore
  const known = KNOWN_ACCOUNTS[cleanEmail] || { role: "doctor", doctorId: "dr-marcelo", nome: user.displayName || "Médico" };
  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  const userSnap = await getDoc(userDocRef);

  let userData;
  if (!userSnap.exists()) {
    userData = {
      uid: user.uid,
      email: cleanEmail,
      role: known.role,
      doctorId: known.doctorId,
      nome: known.nome,
      criadoEm: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    };
    await setDoc(userDocRef, userData, { merge: true });
  } else {
    userData = userSnap.data();
    await setDoc(userDocRef, { ultimoAcesso: new Date().toISOString() }, { merge: true });
  }

  return { user, ...userData };
}

/**
 * Realiza o Logout via Firebase Authentication
 */
export async function logoutFirebaseAuth() {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Observa o estado da autenticação na nuvem em tempo real
 */
export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          callback({ firebaseUser, ...snap.data() });
        } else {
          const cleanEmail = (firebaseUser.email || "").toLowerCase();
          const known = KNOWN_ACCOUNTS[cleanEmail] || { role: "doctor", doctorId: "dr-marcelo", nome: "Médico" };
          const defaultUserData = {
            uid: firebaseUser.uid,
            email: cleanEmail,
            role: known.role,
            doctorId: known.doctorId,
            nome: known.nome
          };
          callback({ firebaseUser, ...defaultUserData });
        }
      } catch (err) {
        console.warn("Erro ao buscar dados do usuário no Firestore:", err);
        callback({ firebaseUser, role: "doctor", doctorId: "dr-marcelo" });
      }
    } else {
      callback(null);
    }
  });
}
