import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
    return envVars;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
});

const db = getFirestore(app);

async function seedEvolution() {
  const querySnapshot = await getDocs(collection(db, 'patients'));
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (data.nome?.includes('ADCÉLIO') || data.nome?.includes('ADCELIO')) {
      const evolucoes = data.evolucoes || [
        {
          id: `evo-demo-01`,
          dataHora: new Date().toISOString(),
          tipoAtendimento: 'Ronda de Hemodiálise',
          intercorrencias: 'Nenhuma',
          paPre: '130/80',
          paPos: '120/80',
          pesoPre: '74.2',
          pesoPos: '72.0',
          ufRetirada: '2200',
          qbEfetivo: '300',
          condutaClinica: 'Paciente em 3º Turno de HD regular via FAV em MSE com excelente frêmito e sopro contínuo. Sem queixas de cefaleia ou náuseas. PA e parâmetros dialíticos mantidos estáveis durante toda a sessão (UF alcançada de 2200ml sem hipotensão). Mantida prescrição de Alfaepoetina e Noripurum pós-HD conforme metas.',
          medicoNome: 'Dra. Gisele',
          medicoCrm: '123456/SP',
          registradoEm: new Date().toISOString()
        }
      ];

      await updateDoc(doc(db, 'patients', docSnap.id), {
        evolucoes,
        atualizadoEm: new Date().toISOString()
      });
      console.log(`✅ Evolução médica registrada para paciente ${data.nome} (${docSnap.id})!`);
    }
  }
  process.exit(0);
}

seedEvolution().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
