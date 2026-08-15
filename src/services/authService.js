import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase.js";

const USERS_COLLECTION = "users";
const DOCTORS_COLLECTION = "doctors";

// Contas e perfis padrão com suporte a validação na nuvem
const SYSTEM_ACCOUNTS = [
  {
    email: "admin@nefroapp.com",
    passwords: ["admin123", "admin"],
    role: "admin",
    doctorId: null,
    nome: "Super Administrador"
  },
  {
    email: "dr.marcelo@nefroapp.com",
    passwords: ["123456", "demo123", "demo", "123"],
    role: "doctor",
    doctorId: "dr-marcelo",
    nome: "Dr. Marcelo Ramos"
  },
  {
    email: "demo@nefroapp.com",
    passwords: ["123456", "demo123", "demo", "123"],
    role: "doctor",
    doctorId: "dr-marcelo",
    nome: "Dr. Marcelo Ramos (Demo)"
  },
  {
    email: "dra.gisele@nefroapp.com",
    passwords: ["123456", "123"],
    role: "doctor",
    doctorId: "dra-gisele",
    nome: "Dra. Gisele"
  }
];

let currentSessionUser = null;
let authSubscribers = [];

function notifySubscribers(user) {
  currentSessionUser = user;
  authSubscribers.forEach(cb => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

/**
 * Autentica o usuário via Firebase Cloud (com suporte a Auth e Firestore Users)
 */
export async function loginWithFirebaseAuth(email, password) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  if (!cleanEmail || !cleanPass) {
    throw new Error("Por favor, preencha o e-mail e a senha.");
  }

  let firebaseUser = null;

  // 1. Tenta autenticação nativa do Firebase Auth (se o provedor estiver ativo no console)
  if (auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      firebaseUser = userCredential.user;
    } catch (authErr) {
      if (authErr.code === 'auth/user-not-found') {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          firebaseUser = newCred.user;
        } catch (e) {
          // Continua para validação em nuvem via Firestore
        }
      }
      // Se for auth/configuration-not-found ou erro de provedor, segue para validação no Firestore
    }
  }

  // 2. Validação baseada nas contas do sistema e Firestore
  let matchedAccount = SYSTEM_ACCOUNTS.find(acc => acc.email === cleanEmail);

  if (matchedAccount) {
    if (!matchedAccount.passwords.includes(cleanPass)) {
      throw new Error("Senha incorreta para a conta informada.");
    }
  } else {
    // Procura na coleção 'doctors' do Firestore para médicos cadastrados dinamicamente
    if (db) {
      try {
        const doctorsSnap = await getDocs(collection(db, DOCTORS_COLLECTION));
        const foundDoc = doctorsSnap.docs.find(d => {
          const data = d.data();
          return (data.email || "").toLowerCase() === cleanEmail;
        });

        if (foundDoc) {
          const docData = foundDoc.data();
          matchedAccount = {
            email: cleanEmail,
            role: "doctor",
            doctorId: foundDoc.id,
            nome: docData.nome || "Médico Nefrologista"
          };
        }
      } catch (err) {
        console.warn("Erro ao buscar médico no Firestore:", err);
      }
    }
  }

  if (!matchedAccount && !firebaseUser) {
    throw new Error("Credenciais inválidas! Verifique seu e-mail e senha.");
  }

  const role = matchedAccount ? matchedAccount.role : "doctor";
  const doctorId = matchedAccount ? matchedAccount.doctorId : null;
  const nome = matchedAccount ? matchedAccount.nome : (firebaseUser?.displayName || "Usuário");
  const uid = firebaseUser?.uid || `cloud-user-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`;

  const userData = {
    uid,
    email: cleanEmail,
    role,
    doctorId,
    activeTenantId: doctorId,
    nome,
    ultimoAcesso: new Date().toISOString()
  };

  // 3. Atualiza o registro do usuário na coleção 'users' do Cloud Firestore
  if (db) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        ...userData,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Erro ao atualizar log de acesso no Firestore:", e);
    }
  }

  const sessionObj = {
    firebaseUser: firebaseUser || { uid, email: cleanEmail },
    ...userData
  };

  notifySubscribers(sessionObj);
  return sessionObj;
}

/**
 * Realiza o Logout via Firebase
 */
export async function logoutFirebaseAuth() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut:", e);
    }
  }
  notifySubscribers(null);
}

/**
 * Observa o estado da autenticação na nuvem em tempo real
 */
export function subscribeToAuthState(callback) {
  authSubscribers.push(callback);

  // Retorna o usuário da sessão em memória atual se existir
  if (currentSessionUser) {
    callback(currentSessionUser);
  }

  let unsubFirebase = () => {};
  if (auth) {
    try {
      unsubFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const cleanEmail = (firebaseUser.email || "").toLowerCase();
          const matched = SYSTEM_ACCOUNTS.find(a => a.email === cleanEmail);
          
          let role = matched?.role || "doctor";
          let doctorId = matched?.doctorId || null;
          let nome = matched?.nome || firebaseUser.displayName || "Médico";
          let activeTenantId = doctorId;

          if (db) {
            try {
              const snap = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
              if (snap.exists()) {
                const data = snap.data();
                role = data.role || role;
                doctorId = data.doctorId || doctorId;
                activeTenantId = data.activeTenantId || doctorId;
                nome = data.nome || nome;
              }
            } catch (err) {
              console.warn(err);
            }
          }

          const userObj = {
            firebaseUser,
            uid: firebaseUser.uid,
            email: cleanEmail,
            role,
            doctorId,
            activeTenantId,
            nome
          };
          notifySubscribers(userObj);
        } else {
          notifySubscribers(null);
        }
      });
    } catch (e) {
      console.warn("onAuthStateChanged error:", e);
    }
  }

  return () => {
    authSubscribers = authSubscribers.filter(cb => cb !== callback);
    unsubFirebase();
  };
}

/**
 * Atualiza o tenant ativo (médico acessado) no Firestore
 */
export async function updateActiveTenant(uid, tenantId) {
  if (!db || !uid || !tenantId) return;
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, { 
      activeTenantId: tenantId, 
      atualizadoEm: new Date().toISOString() 
    }, { merge: true });
  } catch (e) {
    console.warn("Erro ao atualizar tenant na nuvem:", e);
  }
}
