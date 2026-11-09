import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updatePassword,
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0TDoy1FJOBYRQNPIrHcBwk0_rCejVHdM",
  authDomain: "nexai-nefro.firebaseapp.com",
  projectId: "nexai-nefro",
  storageBucket: "nexai-nefro.firebasestorage.app",
  messagingSenderId: "1085284590267",
  appId: "1:1085284590267:web:8950b5a287c77fea107f9e",
  measurementId: "G-0ZQJ0WEWQW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DOCTOR_DATA = {
  id: "dra-maria-tereza",
  nome: "Dra. Maria Tereza",
  email: "mariaterezaalvesfranca@gmail.com",
  password: "123456",
  titulo: "Médica Nefrologista",
  cpf: "",
  cns: "",
  crm: "",
  ufCrm: "MG",
  rqe: "",
  especialidade: "Nefrologia Clínica e Hemodiálise",
  telefone: "",
  clinicaPrincipal: "Dialize Betim",
  hospitalVinculo: "",
  unidadeDialise: "Dialize Betim",
  bio: "Médica Nefrologista atuante em Nefrologia Clínica e Hemodiálise.",
  statusLicenca: "Ativo",
  tipoConta: "Médico Assinante",
  plano: "Mensal",
  valorMensalidade: 490.00,
  valorBase: 490.00,
  descontoTipo: "nenhum",
  descontoValor: 0,
  modalidadeCobranca: "mensal",
  quantidadeParcelas: 1,
  valorTotalContrato: 490.00,
  valorParcela: 490.00,
  modulos: {
    dialise: true,
    consultorio: true
  },
  locaisAtuacao: [
    {
      id: "loc-betim-01",
      nome: "Dialize Betim",
      tipo: "Clínica de Hemodiálise",
      cidade: "Betim/MG",
      endereco: "",
      turnos: "1º, 2º e 3º Turnos",
      diasSemana: "Seg/Qua/Sex",
      rtNome: "Dra. Maria Tereza",
      rtCrm: "",
      telefoneEnfermagem: "",
      status: "Ativo",
      criadoEm: new Date().toISOString()
    }
  ],
  pacientesCount: 0
};

async function main() {
  console.log("🚀 Iniciando criação de acesso para:", DOCTOR_DATA.nome, DOCTOR_DATA.email);
  let firebaseUid = null;

  // 1. Criar ou atualizar no Firebase Authentication
  try {
    console.log("1️⃣ Criando conta no Firebase Auth...");
    const userCred = await createUserWithEmailAndPassword(auth, DOCTOR_DATA.email, DOCTOR_DATA.password);
    firebaseUid = userCred.user.uid;
    console.log("✅ Usuário criado no Firebase Auth com UID:", firebaseUid);
    
    try {
      await updateProfile(userCred.user, { displayName: DOCTOR_DATA.nome });
    } catch (e) {
      console.warn("Aviso ao definir displayName:", e.message);
    }
  } catch (authErr) {
    if (authErr.code === 'auth/email-already-in-use') {
      console.log("ℹ️ Conta já existe no Firebase Auth. Atualizando senha...");
      try {
        const signinCred = await signInWithEmailAndPassword(auth, DOCTOR_DATA.email, DOCTOR_DATA.password);
        firebaseUid = signinCred.user.uid;
        console.log("✅ Login bem-sucedido com senha existente. UID:", firebaseUid);
      } catch (signInErr) {
        console.warn("⚠️ Não foi possível logar com a senha nova diretamente:", signInErr.message);
      }
    } else {
      console.error("❌ Erro no Firebase Auth:", authErr.code, authErr.message);
    }
  }

  const now = new Date();
  const dataInicio = now.toISOString();
  const dataFim = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 ano de vigência

  // 2. Criar / Atualizar documento na coleção 'doctors'
  console.log("2️⃣ Gravando perfil na coleção 'doctors' (ID: dra-maria-tereza)...");
  const doctorRef = doc(db, "doctors", DOCTOR_DATA.id);
  const doctorSnap = await getDoc(doctorRef);

  const doctorPayload = {
    ...DOCTOR_DATA,
    dataInicioAssinatura: doctorSnap.exists() ? (doctorSnap.data().dataInicioAssinatura || dataInicio) : dataInicio,
    dataFimAssinatura: doctorSnap.exists() ? (doctorSnap.data().dataFimAssinatura || dataFim) : dataFim,
    historicoPagamentos: doctorSnap.exists() && doctorSnap.data().historicoPagamentos ? doctorSnap.data().historicoPagamentos : [
      {
        id: `pag-${Date.now()}`,
        data: dataInicio,
        valor: DOCTOR_DATA.valorMensalidade,
        plano: "Plano Mensal Nefrologia",
        status: "Pago",
        metodo: "PIX",
        referencia: "Contratação Inicial da Licença"
      }
    ],
    criadoEm: doctorSnap.exists() ? (doctorSnap.data().criadoEm || dataInicio) : dataInicio,
    atualizadoEm: dataInicio
  };
  delete doctorPayload.password;

  await setDoc(doctorRef, doctorPayload, { merge: true });
  console.log("✅ Documento 'doctors/dra-maria-tereza' salvo com sucesso!");

  // 3. Criar / Atualizar documento na coleção 'users'
  const userDocId = firebaseUid || `cloud-user-${DOCTOR_DATA.email.replace(/[^a-z0-9]/g, '-')}`;
  console.log(`3️⃣ Gravando documento na coleção 'users' (ID: ${userDocId})...`);
  const userRef = doc(db, "users", userDocId);
  await setDoc(userRef, {
    uid: userDocId,
    email: DOCTOR_DATA.email.toLowerCase(),
    role: "doctor",
    doctorId: DOCTOR_DATA.id,
    activeTenantId: DOCTOR_DATA.id,
    nome: DOCTOR_DATA.nome,
    criadoEm: dataInicio,
    ultimoAcesso: dataInicio,
    atualizadoEm: dataInicio
  }, { merge: true });
  console.log(`✅ Documento 'users/${userDocId}' salvo com sucesso!`);

  // 4. Registrar Trilha de Auditoria
  console.log("4️⃣ Registrando evento na coleção 'audit_logs'...");
  const auditId = `audit-${Date.now()}-dra-maria-tereza`;
  await setDoc(doc(db, "audit_logs", auditId), {
    id: auditId,
    timestamp: dataInicio,
    tipoAcao: "LICENSE_CREATED",
    descricao: `Criação de acesso e licença médica para ${DOCTOR_DATA.nome} (${DOCTOR_DATA.email}) com clínica principal Dialize Betim`,
    adminEmail: "admin@nefroapp.com",
    targetDoctorId: DOCTOR_DATA.id,
    targetDoctorName: DOCTOR_DATA.nome,
    detalhes: {
      doctorId: DOCTOR_DATA.id,
      email: DOCTOR_DATA.email,
      clinicaPrincipal: DOCTOR_DATA.clinicaPrincipal,
      plano: DOCTOR_DATA.plano,
      statusLicenca: DOCTOR_DATA.statusLicenca
    }
  });
  console.log("✅ Log de auditoria registrado!");

  console.log("\n🎉 CONCLUÍDO COM SUCESSO!");
  console.log("-----------------------------------------");
  console.log("Médica: Dra. Maria Tereza");
  console.log("E-mail:", DOCTOR_DATA.email);
  console.log("Senha:", DOCTOR_DATA.password);
  console.log("Local de atuação:", "Dialize Betim");
  console.log("ID da Licença:", DOCTOR_DATA.id);
  console.log("UID no Firebase:", userDocId);
  console.log("-----------------------------------------");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Falha na execução:", err);
  process.exit(1);
});

