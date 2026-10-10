import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEMO_PATIENTS_DATA } from '../src/data/demoPatients.js';
import { auditPatientEvolutionData } from '../src/utils/monthlyEvolutionGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log("🏥 Enriquecendo base de demonstração do Dr. Marcelo com cenários clínicos realistas e casos fora da meta...");

const patients = JSON.parse(JSON.stringify(DEMO_PATIENTS_DATA));

// 1. Paciente 2: Maria de Fátima Oliveira - SOBRECARGA HÍDRICA GRAVE / PESOS RUINS & PRONTUÁRIO INCOMPLETO (SCORE 71%)
const p2 = patients.find(p => p.id === 'paciente-demo-02');
if (p2) {
  // Prontuário incompleto para auditoria da evolução
  p2.pesoSeco = null;
  p2.posicaoAcesso = "";
  if (p2.acessoVascular) {
    p2.acessoVascular.ladoMembro = "";
  }
  p2.observacoesClinicas = "Paciente com quadro frequente de sobrecarga hídrica volumétrica interdialítica grave e má adesão à restrição de sódio e líquidos. Edema periférico e picos hipertensivos intradialíticos.";
  
  // Pesagens ruins / hipervolemia crítica
  p2.historicoPesos = [
    {
      id: "peso-02-1-pre",
      data: "2026-10-03T08:00:00.000Z",
      peso: 62.8,
      tipo: "Pré-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 5.3,
      observacoes: "Hipervolemia severa (+5.3kg). Dispneia ao repouso, PA 180/100 mmHg, edema MMII 3+/4+.",
      registradoEm: "2026-10-03T08:00:00.000Z"
    },
    {
      id: "peso-02-1-pos",
      data: "2026-10-03T12:00:00.000Z",
      peso: 59.2,
      tipo: "Pós-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 1.7,
      observacoes: "Hipervolemia residual (+1.7kg). UF suspensa antes do término devido a câimbras severas.",
      registradoEm: "2026-10-03T12:00:00.000Z"
    },
    {
      id: "peso-02-2-pre",
      data: "2026-10-01T08:00:00.000Z",
      peso: 62.1,
      tipo: "Pré-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 4.6,
      observacoes: "Ganho interdialítico crítico (>8% peso seco). Ortopneia.",
      registradoEm: "2026-10-01T08:00:00.000Z"
    },
    {
      id: "peso-02-2-pos",
      data: "2026-10-01T12:00:00.000Z",
      peso: 58.8,
      tipo: "Pós-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 1.3,
      observacoes: "UF parcial tolerada. Persiste edema leve bimaleolar.",
      registradoEm: "2026-10-01T12:00:00.000Z"
    },
    {
      id: "peso-02-3-pre",
      data: "2026-09-29T08:00:00.000Z",
      peso: 61.9,
      tipo: "Pré-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 4.4,
      observacoes: "Hipervolemia reincidente. Orientada restrição rigorosa de sal.",
      registradoEm: "2026-09-29T08:00:00.000Z"
    },
    {
      id: "peso-02-3-pos",
      data: "2026-09-29T12:00:00.000Z",
      peso: 58.5,
      tipo: "Pós-HD",
      pesoSecoReferencia: 57.5,
      ganhoInterdialitico: 1.0,
      observacoes: "Pós-HD com peso acima da meta estimada.",
      registradoEm: "2026-09-29T12:00:00.000Z"
    }
  ];

  // Exames fora da meta
  p2.exames.fosforo = 8.2; // Hiperfosfatemia severa
  p2.exames.k = 6.2; // Hipercalemia moderada
  p2.exames.pth = 780; // PTH descontrolado
  p2.exames.ureiaPre = 198;
}

// 2. Paciente 3: Sebastião Ferreira Lima - HIPOVOLEMIA / HIPOTENSÃO INTRADIALÍTICA & PESOS RUINS ABAIXO DO SECO
const p3 = patients.find(p => p.id === 'paciente-demo-03');
if (p3) {
  p3.pesoSeco = 74.0;
  p3.observacoesClinicas = "Paciente com episódios frequentes de hipotensão intradialítica sintomática e desidratação pós-sessão. Apresenta perda de apetite e episódios diarreicos intermitentes.";
  
  // Pesagens ruins / desidratação e choque hipotensivo
  p3.historicoPesos = [
    {
      id: "peso-03-1-pre",
      data: "2026-10-03T08:00:00.000Z",
      peso: 73.1,
      tipo: "Pré-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -0.9,
      observacoes: "Paciente desidratado em domicílio (-0.9kg abaixo do seco). Mucosas secas.",
      registradoEm: "2026-10-03T08:00:00.000Z"
    },
    {
      id: "peso-03-1-pos",
      data: "2026-10-03T12:00:00.000Z",
      peso: 71.2,
      tipo: "Pós-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -2.8,
      observacoes: "Intercorrência grave de choque hipotensivo intradialítico (PA 75/45 mmHg), vômitos e tontura. Necessitou suspensão de UF e expansão volêmica com 500 mL de SF 0.9%.",
      registradoEm: "2026-10-03T12:00:00.000Z"
    },
    {
      id: "peso-03-2-pre",
      data: "2026-10-01T08:00:00.000Z",
      peso: 73.3,
      tipo: "Pré-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -0.7,
      observacoes: "Peso pré abaixo da meta do peso seco.",
      registradoEm: "2026-10-01T08:00:00.000Z"
    },
    {
      id: "peso-03-2-pos",
      data: "2026-10-01T12:00:00.000Z",
      peso: 71.8,
      tipo: "Pós-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -2.2,
      observacoes: "Hipotensão sintomática ao final da sessão.",
      registradoEm: "2026-10-01T12:00:00.000Z"
    },
    {
      id: "peso-03-3-pre",
      data: "2026-09-29T08:00:00.000Z",
      peso: 73.6,
      tipo: "Pré-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -0.4,
      observacoes: "Queixa de astenia e redução do apetite.",
      registradoEm: "2026-09-29T08:00:00.000Z"
    },
    {
      id: "peso-03-3-pos",
      data: "2026-09-29T12:00:00.000Z",
      peso: 72.1,
      tipo: "Pós-HD",
      pesoSecoReferencia: 74.0,
      ganhoInterdialitico: -1.9,
      observacoes: "Hipotensão postural ao levantar.",
      registradoEm: "2026-09-29T12:00:00.000Z"
    }
  ];

  // Exames fora da meta
  p3.exames.albumina = 2.8; // Desnutrição proteica
  p3.exames.creatinina = 6.2; // Perda de massa muscular
  p3.exames.hco3 = 15; // Acidose metabólica
}

// 3. Paciente 4: Francisca Alves Santos - ANEMIA REFRATÁRIA GRAVE & PRONTUÁRIO INCOMPLETO (SCORE 71%)
const p4 = patients.find(p => p.id === 'paciente-demo-04');
if (p4) {
  p4.etiologiaDRC = "";
  p4.dataInicioDialise = "";
  p4.observacoesClinicas = "Paciente com quadro de anemia ferropênica e refratária de difícil manejo. Fadiga incapacitante, dispneia aos médios esforços. LME CEAF vencida há 15 dias aguardando renovação.";
  
  // Exames críticos de anemia e ferropenia
  p4.exames.hb = 7.1; // Muito abaixo da meta 10-12
  p4.exames.ht = 21.4;
  p4.exames.ferritina = 38; // Depleção férrea severa
  p4.exames.ist = 9.5;
  p4.exames.ferro = 24;
}

// 4. Paciente 5: Antônio Carlos Pereira - HIPERPARATIREOIDISMO SEVERO / DMO-DRC CRÍTICO
const p5 = patients.find(p => p.id === 'paciente-demo-05');
if (p5) {
  p5.observacoesClinicas = "Paciente com Hiperparatireoidismo Terciário severo com alto turnover ósseo e dores ósseas intensas. Produto Ca x P > 90 com elevado risco de calcificação vascular e cardiovascular.";
  p5.exames.pth = 1520; // Crítico (meta 150-600)
  p5.exames.fosforo = 8.7; // Muito elevado
  p5.exames.ca = 10.9; // Hipercalcemia
  p5.exames.fa = 430; // Fosfatase alcalina alta
}

// 5. Paciente 6: Neuza Maria de Souza - SUBDIÁLISE / MÁ ADEQUAÇÃO DIALÍTICA & PRONTUÁRIO INCOMPLETO (SCORE 86%)
const p6 = patients.find(p => p.id === 'paciente-demo-06');
if (p6) {
  p6.posicaoAcesso = "";
  if (p6.acessoVascular) {
    p6.acessoVascular.ladoMembro = "";
  }
  p6.observacoesClinicas = "Paciente com má adequação dialítica crônica (Kt/V < 1.0). Sintomas urêmicos subclínicos como inapetência e náuseas matinais. Indicado aumento do tempo de sessão e fluxo.";
  p6.exames.ktv = 0.92; // Meta KDIGO >= 1.2
  p6.exames.ur = 49;
  p6.exames.ureiaPre = 230;
  p6.exames.ureiaPos = 118;
  p6.exames.creatinina = 13.8;
}

// 6. Paciente 7: José Ribamar Gonçalves - HIPERCALEMIA GRAVE (RISCO DE PCR) & ACIDOSE SEVERA
const p7 = patients.find(p => p.id === 'paciente-demo-07');
if (p7) {
  p7.observacoesClinicas = "Paciente com transgressões dietéticas recorrentes ricas em potássio (frutas tropicais, água de coco). Risco imediato de arritmia maligna e parada cardíaca. Indicado banho de K 1.0 mEq/L.";
  p7.exames.k = 6.9; // Nível crítico de emergência médica!
  p7.exames.hco3 = 13.0; // Acidose metabólica severa
  p7.exames.ureiaPre = 210;
}

// 7. Paciente 8: Terezinha de Jesus Costa - PRONTUÁRIO MUITO DEFASADO (SCORE 57%) & TRANSPLANTE CONTRAINDICADO
const p8 = patients.find(p => p.id === 'paciente-demo-08');
if (p8) {
  p8.pesoSeco = null;
  p8.etiologiaDRC = "";
  p8.tipoAcesso = "";
  if (p8.acessoVascular) {
    p8.acessoVascular.tipo = "";
  }
  p8.statusTransplante = "Contraindicado / Inapto";
  p8.observacoesClinicas = "Paciente inapta para transplante renal devido a neoplasia mamária em seguimento oncológico e cardiopatia isquêmica grave multiarterial não revascularizável. Prontuário com dados cadastrais pendentes de revisão.";
}

// 8. Paciente 9: Raimundo Nonato Barbosa - DISFUNÇÃO GRAVE DE ACESSO VASCULAR (PERMCATH DISFUNCIONAL)
const p9 = patients.find(p => p.id === 'paciente-demo-09');
if (p9) {
  p9.tipoAcesso = "Permcath";
  if (p9.acessoVascular) {
    p9.acessoVascular.tipo = "Permcath";
    p9.acessoVascular.fluxoSangue = 200;
  }
  p9.observacoesClinicas = "Cateter Permcath apresentando fluxos insuficientes (Qb máximo 200 mL/min), pressões venosas anormais e necessidade de inversão frequente de linhas. Histórico recente de bacteremia tratada.";
  p9.exames.ktv = 1.05; // Baixo KtV decorrente de fluxo deficiente
}

// 9. Paciente 10: Benedita Soares Mendes - SÍNDROME MIA (DESNUTRIÇÃO & INFLAMAÇÃO SEVERA)
const p10 = patients.find(p => p.id === 'paciente-demo-10');
if (p10) {
  p10.observacoesClinicas = "Paciente com síndrome de desnutrição-inflamação-aterosclerose (Síndrome MIA). Perda de peso não intencional e sarcopenia evidente. Diabetes mellitus muito descompensado.";
  p10.exames.albumina = 2.6; // Muito depletada
  p10.exames.pcr = 38.5; // Inflamação marcante
  p10.exames.glicemia = 295;
  p10.exames.hba1c = 11.2;
}

// Grava o arquivo src/data/demoPatients.js atualizado
const outContent = `/**
 * Base de Pacientes de Demonstração Completa e Realística para Apresentação
 * Cobre 100% dos recursos clínicos, turnos, acessos vasculares, exames, histórico de intervenções,
 * pesos, prescrições, LME e alertas de medicamentos.
 * 60 Pacientes distribuídos igualmente em 3 Clínicas:
 * - Clínica Renalis (20 pacientes)
 * - Clínica Nefrovita (20 pacientes)
 * - Clínica Hemovida (20 pacientes)
 * Contém cenários clínicos normais e casos críticos para testes:
 * - Pacientes com prontuários incompletos (<100% no checklist de evolução)
 * - Pacientes com pesos hipervolêmicos e hipovolêmicos/desidratados
 * - Pacientes com anemia severa, hipercalemia de risco, hiperparatireoidismo e desnutrição
 */

export const DEMO_PATIENTS_DATA = ${JSON.stringify(patients, null, 2)};
`;

const demoFilePath = path.join(rootDir, 'src', 'data', 'demoPatients.js');
fs.writeFileSync(demoFilePath, outContent, 'utf8');
console.log(`✅ ${demoFilePath} atualizado com sucesso!`);

// Validação dos scores de auditoria para evolução
console.log("\n📊 Validação dos Scores de Auditoria de Evolução:");
[p2, p3, p4, p5, p6, p7, p8, p9, p10].forEach(p => {
  const audit = auditPatientEvolutionData(p);
  console.log(`• ${p.nome} (${p.id}): Score = ${audit.score}% | Completo = ${audit.isComplete} | Pendências = [${audit.missingFields.map(f => f.label).join(', ')}]`);
});
