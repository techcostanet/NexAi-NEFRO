import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const DOCUMENTS_COLLECTION = 'consultorio_documents';
export const DOCTORS_COLLECTION = 'doctors';

// Kits de Exames Ambulatoriais Pré-Configurados em Nefrologia
export const EXAM_KITS = [
  {
    id: 'checkup',
    nome: 'Check-up Nefrológico Geral',
    descricao: 'Rastreio inicial de função renal, proteinúria e distúrbios metabólicos',
    exames: [
      'Creatinina sérica',
      'Ureia sérica',
      'Taxa de Filtração Glomerular Estimada (TFGe)',
      'EAS / Urina tipo 1',
      'Relação Albuminúria/Creatinúria (RAC) em amostra isolada',
      'Sódio e Potássio séricos',
      'Cálcio total e Fósforo sérico',
      'Ácido Úrico sérico',
      'Glicemia em jejum',
      'Hemograma completo',
      'Perfil lipídico (Colesterol total e frações, Triglicérides)'
    ]
  },
  {
    id: 'drc_conservador',
    nome: 'DRC Conservador (KDIGO)',
    descricao: 'Seguimento de Doença Renal Crônica estágios 1 a 5 não dialíticos',
    exames: [
      'Creatinina sérica com TFGe',
      'Ureia sérica',
      'Relação Albuminúria/Creatinúria (RAC) ou Proteinúria/Creatinúria (RPC)',
      'EAS / Urina 1',
      'Potássio sérico',
      'Bicarbonato sérico / Gasometria venosa',
      'Cálcio total e Fósforo sérico',
      'PTH intacto (Paratormônio)',
      '25-OH Vitamina D',
      'Ferritina sérica e Índice de Saturação da Transferrina (IST)',
      'Hemograma completo',
      'Albumina sérica'
    ]
  },
  {
    id: 'litiase',
    nome: 'Investigação Metabólica de Litíase Urinária',
    descricao: 'Avaliação bioquímica e urina de 24h para nefrolitíase recorrente',
    exames: [
      'Urina de 24 horas (Volume urinário, Calciúria, Oxalúria, Citratúria, Uricosúria, Creatinúria de 24h)',
      'EAS / Urina 1 com pH urinário',
      'Urocultura com Antibiograma',
      'Creatinina sérica e Ácido Úrico sérico',
      'Cálcio sérico total e Cálcio iônico',
      'Fósforo sérico e Magnésio sérico',
      'PTH intacto',
      'Gasometria venosa / Bicarbonato',
      'Ultrassonografia de Rins e Vias Urinárias'
    ]
  },
  {
    id: 'glomerulopatia',
    nome: 'Glomerulopatias e Proteinúria',
    descricao: 'Investigação de síndrome nefrótica, nefrítica e doenças autoimunes',
    exames: [
      'Relação Proteinúria/Creatinúria (RPC) em amostra isolada',
      'Proteinúria de 24 horas',
      'EAS / Urina 1 com pesquisa de dismorfismo eritrocitário',
      'Eletroforese de proteínas séricas e urinárias',
      'Complemento sérico (C3 e C4)',
      'Fator Antinúcleo (FAN) e Anti-DNA dupla hélice',
      'Sorologias: HBsAg, Anti-HBc, Anti-HCV e Anti-HIV 1 e 2',
      'Creatinina, Ureia e Albumina sérica',
      'Ultrassonografia com Doppler de Artérias Renais'
    ]
  },
  {
    id: 'pre_transplante',
    nome: 'Checklist Pré-Transplante Ambulatorial',
    descricao: 'Painel ambulatorial de inscrição e reavaliação de receptor em lista',
    exames: [
      'Tipagem sanguínea ABO e Fator Rh',
      'Sorologias completas (CMV IgG/IgM, EBV IgG/IgM, Chagas, Toxoplasmose, VDRL, HBV, HCV, HIV)',
      'Painel de Anticorpos Reativos contra Painel (PRA)',
      'Creatinina, Ureia, Eletrólitos completos',
      'Coagulograma completo (TAP, TTPA, Fibrinogênio)',
      'Ecocardiograma Transtorácico com Doppler',
      'Raio-X de Tórax (PA e Perfil)',
      'Ultrassonografia de Abdome Total e Rins'
    ]
  },
  {
    id: 'pos_transplante',
    nome: 'Seguimento Pós-Transplante Renal',
    descricao: 'Monitoramento de enxerto renal e dosagem de imunossupressores',
    exames: [
      'Nível sérico de Tacrolimo (vale) ou Ciclosporina',
      'Creatinina sérica e Ureia',
      'Hemograma completo com plaquetas',
      'Sódio, Potássio e Magnésio sérico',
      'Glicemia de jejum e Hemoglobina Glicada (HbA1c)',
      'EAS / Urina 1 e Urocultura',
      'Proteína C Reativa (PCR ultrassensível)',
      'Carga Viral para Citomegalovírus (CMV por PCR quantitativo, se indicado)'
    ]
  }
];

// Configuração padrão da Grade de Atendimento
export const DEFAULT_GRADE_CONFIG = {
  duracaoMinutos: 30,
  valorParticularPadrao: 400,
  conveniosAceitos: [
    'Particular',
    'Unimed',
    'Bradesco Saúde',
    'SulAmérica',
    'Cassi',
    'Geap',
    'Amil',
    'Porto Seguro',
    'NotreDame Intermédica'
  ],
  diasSemana: {
    seg: { ativo: true, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '14:00', fimTarde: '18:00' },
    ter: { ativo: true, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '14:00', fimTarde: '18:00' },
    qua: { ativo: true, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '14:00', fimTarde: '18:00' },
    qui: { ativo: true, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '14:00', fimTarde: '18:00' },
    sex: { ativo: true, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '14:00', fimTarde: '18:00' },
    sab: { ativo: false, inicioManha: '08:00', fimManha: '12:00', inicioTarde: '', fimTarde: '' },
    dom: { ativo: false, inicioManha: '', fimManha: '', inicioTarde: '', fimTarde: '' }
  }
};

/**
 * Escuta em tempo real os documentos emitidos no consultório de um médico
 */
export function subscribeConsultorioDocuments(doctorId, callback) {
  if (!doctorId) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('doctorId', '==', doctorId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Ordena por data decrescente
        docs.sort((a, b) => {
          const tA = a.criadoEm || a.data || '';
          const tB = b.criadoEm || b.data || '';
          return tB.localeCompare(tA);
        });

        callback(docs);
      },
      (error) => {
        console.error('Erro ao escutar documentos do consultório:', error);
        callback([]);
      }
    );
  } catch (err) {
    console.error('Falha ao inicializar listener de documentos:', err);
    callback([]);
    return () => {};
  }
}

/**
 * Cria um novo documento no Firestore (Pedido de Exame, Atestado, Declaração, Parecer, Recibo)
 */
export async function createConsultorioDocument(documentData) {
  const payload = {
    ...documentData,
    tipo: documentData.tipo || 'exames',
    data: documentData.data || new Date().toISOString().split('T')[0],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), payload);
  return { id: docRef.id, ...payload };
}

/**
 * Remove um documento do Firestore
 */
export async function deleteConsultorioDocument(documentId) {
  if (!documentId) return;
  const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
  await deleteDoc(docRef);
}

/**
 * Salva a grade de horários e preferências de consultório do médico
 */
export async function saveDoctorGradeConsultorio(doctorId, gradeData) {
  if (!doctorId) throw new Error('ID do médico não informado');
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  await setDoc(docRef, {
    gradeConsultorio: gradeData,
    atualizadoEm: new Date().toISOString()
  }, { merge: true });
  return gradeData;
}
