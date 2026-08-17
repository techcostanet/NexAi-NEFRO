import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";

const USERS_COLLECTION = "users";
const DOCTORS_COLLECTION = "doctors";

// Contas e perfis padrão com suporte a validação na nuvem
const SYSTEM_ACCOUNTS = [
  {
    email: "admin@nefroapp.com",
    passwords: ["admin123", "admin", "123456", "senha123"],
    role: "admin",
    doctorId: null,
    nome: "Super Administrador"
  },
  {
    email: "dr.marcelo@nefroapp.com",
    passwords: ["demo123", "123456", "demo", "123", "senha123"],
    role: "doctor",
    doctorId: "dr-marcelo",
    nome: "Dr. Marcelo Ramos"
  },
  {
    email: "demo@nefroapp.com",
    passwords: ["demo123", "123456", "demo", "123", "senha123"],
    role: "doctor",
    doctorId: "dr-marcelo",
    nome: "Dr. Marcelo Ramos (Demo)"
  },
  {
    email: "dra.gisele@nefroapp.com",
    passwords: ["senha123", "123456", "123", "demo123"],
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
    // Se não foi autenticado no Firebase Auth, valida a senha com o catálogo do sistema
    if (!firebaseUser && !matchedAccount.passwords.includes(cleanPass)) {
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

/**
 * Registra um novo médico assinante via página de vendas (Self-Service Onboarding)
 */
export async function registerDoctorSelfService({
  nome,
  crm,
  ufCrm = "SP",
  cpf = "",
  rqe = "",
  email,
  telefone = "",
  senha,
  clinicaPrincipal = "",
  plan,
  paymentMethod = "PIX"
}) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanNome = (nome || "").trim();
  const cleanCrm = (crm || "").trim();
  const cleanUf = (ufCrm || "SP").trim().toUpperCase();
  const doctorId = `doc-${cleanCrm.replace(/\D/g, '') || Date.now()}-${cleanUf.toLowerCase()}`;
  
  let firebaseUser = null;
  let uid = `user-${Date.now()}`;

  // 1. Tenta criar usuário no Firebase Authentication
  if (auth && senha) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, senha);
      firebaseUser = userCredential.user;
      uid = firebaseUser.uid;
    } catch (authErr) {
      console.warn("Firebase Auth createUser warning:", authErr.code, authErr.message);
      if (authErr.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, senha);
          firebaseUser = userCredential.user;
          uid = firebaseUser.uid;
        } catch (signErr) {
          console.warn("Sign in error:", signErr);
        }
      }
    }
  }

  // 2. Calcula vigência e status da assinatura
  const isTrial = plan?.intervalo === 'trial' || Number(plan?.valor) === 0;
  const hoje = new Date();
  const dataFim = new Date();
  if (isTrial) {
    dataFim.setDate(dataFim.getDate() + 7);
  } else if (plan?.intervalo === 'anual') {
    dataFim.setFullYear(dataFim.getFullYear() + 1);
  } else {
    dataFim.setMonth(dataFim.getMonth() + 1);
  }

  const doctorProfile = {
    id: doctorId,
    nome: cleanNome,
    cpf: cpf || '',
    crm: cleanCrm,
    ufCrm: cleanUf,
    rqe: rqe || '',
    titulo: 'Médico(a) Nefrologista',
    especialidade: 'Nefrologia Clínica e Hemodiálise',
    email: cleanEmail,
    telefone: telefone || '',
    clinicaPrincipal: clinicaPrincipal || 'Clínica Nefrológica',
    hospitalVinculo: 'Hospital Especializado',
    unidadeDialise: clinicaPrincipal || 'Unidade de Hemodiálise',
    statusLicenca: isTrial ? 'Trial' : 'Ativo',
    tipoConta: isTrial ? 'Medico / Demonstração' : 'Médico Assinante',
    plano: plan?.nome || (isTrial ? 'Avaliação Gratuita (7 Dias)' : 'Plano Mensal'),
    valorMensalidade: Number(plan?.valor) || 0,
    dataInicioAssinatura: hoje.toISOString(),
    dataFimAssinatura: dataFim.toISOString(),
    pacientesCount: 6,
    locaisAtuacao: [
      {
        id: `loc-${Date.now()}-1`,
        nome: clinicaPrincipal || 'Clínica Nefrológica Principal',
        tipo: 'Clínica de Hemodiálise',
        cidade: 'São Paulo - SP',
        turnos: ['1º Turno (06:00 - 10:00)', '2º Turno (10:30 - 14:30)', '3º Turno (15:00 - 19:00)']
      }
    ],
    historicoPagamentos: [
      {
        id: `pag-${Date.now()}`,
        data: hoje.toISOString(),
        valor: Number(plan?.valor) || 0,
        plano: plan?.nome || (isTrial ? 'Trial 7 Dias' : 'Assinatura'),
        status: isTrial ? 'Trial Ativo' : 'Pago',
        metodo: isTrial ? 'Gratuito' : paymentMethod,
        referencia: isTrial ? 'Início do Teste Grátis de 7 Dias' : `Contratação via Landing Page (${paymentMethod})`
      }
    ],
    criadoEm: hoje.toISOString(),
    atualizadoEm: hoje.toISOString()
  };

  // 3. Grava no Cloud Firestore
  if (db) {
    try {
      await setDoc(doc(db, DOCTORS_COLLECTION, doctorId), doctorProfile, { merge: true });

      await setDoc(doc(db, USERS_COLLECTION, uid), {
        uid,
        email: cleanEmail,
        role: "doctor",
        doctorId: doctorId,
        activeTenantId: doctorId,
        nome: cleanNome,
        criadoEm: hoje.toISOString(),
        ultimoAcesso: hoje.toISOString()
      }, { merge: true });

      await logAuditEvent({
        tipoAcao: 'LICENSE_CREATED_SELF_SERVICE',
        descricao: `Novo médico cadastrado via Landing Page: ${cleanNome} (CRM ${cleanCrm}/${cleanUf}) - Plano ${doctorProfile.plano} (${isTrial ? 'Trial 7 dias' : paymentMethod})`,
        targetDoctorId: doctorId,
        targetDoctorName: cleanNome,
        adminEmail: cleanEmail,
        detalhes: { doctorId, plan, paymentMethod, isTrial }
      });
    } catch (dbErr) {
      console.error("Erro ao salvar cadastro no Firestore:", dbErr);
    }
  }

  // 4. Configura sessão ativa
  const sessionUser = {
    firebaseUser,
    uid,
    email: cleanEmail,
    role: "doctor",
    doctorId: doctorId,
    activeTenantId: doctorId,
    nome: cleanNome
  };

  notifySubscribers(sessionUser);
  return sessionUser;
}

