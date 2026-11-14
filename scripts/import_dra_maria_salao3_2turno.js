import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import { db } from '../src/config/firebase.js';
import { doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';

const pdfPath = 'C:/Users/Usuario/.gemini/antigravity/brain/d03c4705-1ede-4225-b6be-549f2ac6c3f4/.user_uploaded/media_1794663747152_37e7f0f6.pdf';

const PATIENTS = [
  'ALEXANDRA GONCALVES',
  'ALMIR MORAIS DE MIRANDA',
  'ANDREI DUTRA NASTRI',
  'ANTENOR JOSE DOS SANTOS',
  'ANTONIA FERREIRA DE FIGUEIREDO',
  'ANTONIO ALVES DA SILVA',
  'CARLOS ANTONIO QUEIROGA',
  'ENILSON JOSE ALVES',
  'GILMA MARIA CUNHA MELO',
  'GLADSTONE MENDES MOREIRA',
  'IRACI DA ANUNCIAÇÃO',
  'IVANI DE CARVALHO DA SILVA',
  'JOELITON DA SILVA MEDEIROS',
  'JOSE BOSCO DOS SANTOS',
  'JOSE CARLOS DE OLIVEIRA',
  'JUAREZ ALVES DE LIMA',
  'LAURO REIS DE OLIVEIRA',
  'LEONARD JANNEU FERREIRA',
  'LUIDY ANTONIO MAIA DE ALCANTARA',
  'LUIZ GONZAGA DE OLIVEIRA',
  'MARIA PERPETUA GOMES DA SILVA',
  'MARLENE FREITAS PEREIRA',
  'MILTON LEITE DA CUNHA',
  'PAULO SERGIO DA ROCHA',
  'REALINA DE ASSIS ANDRADE SALES',
  'REGINA CELIA CASEMIRA COELHO',
  'RIVALDO QUARESMA DE OLIVEIRA',
  'ROSELI MERENCIANA DE BARCELOS',
  'SERGIO ADEMIR DOS PASSOS',
  'SILVANIA MAZINE DE MATTOS'
];

const COLUMN_DEFS = [
  { field: 'hemacias', headerX: 99, minX: 90, maxX: 112 },
  { field: 'leucocitos', headerX: 121, minX: 112, maxX: 138 },
  { field: 'hb', headerX: 147, minX: 138, maxX: 158 },
  { field: 'ht', headerX: 164, minX: 158, maxX: 178 },
  { field: 'ferritina', headerX: 185, minX: 178, maxX: 202 },
  { field: 'ist', headerX: 209, minX: 202, maxX: 224 },
  { field: 'ca', headerX: 231, minX: 224, maxX: 244 },
  { field: 'fosforo', headerX: 252, minX: 244, maxX: 264 },
  { field: 'pth', headerX: 269, minX: 264, maxX: 288 },
  { field: 'aluminio', headerX: 295, minX: 288, maxX: 304 },
  { field: 'fa', headerX: 312, minX: 304, maxX: 324 },
  { field: 'creatinina', headerX: 332, minX: 324, maxX: 344 },
  { field: 'ureiaPre', headerX: 352, minX: 344, maxX: 364 },
  { field: 'ureiaPos', headerX: 372, minX: 364, maxX: 384 },
  { field: 'pru', headerX: 392, minX: 384, maxX: 406 },
  { field: 'ktv', headerX: 414, minX: 406, maxX: 426 },
  { field: 'k', headerX: 435, minX: 426, maxX: 444 },
  { field: 'albumina', headerX: 452, minX: 444, maxX: 462 },
  { field: 'colesterol', headerX: 469, minX: 462, maxX: 482 },
  { field: 'hdl', headerX: 489, minX: 482, maxX: 502 },
  { field: 'ldl', headerX: 510, minX: 502, maxX: 522 },
  { field: 'triglicerides', headerX: 530, minX: 522, maxX: 540 },
  { field: 'tgp', headerX: 547, minX: 540, maxX: 560 },
  { field: 'glicemia', headerX: 569, minX: 560, maxX: 582 },
  { field: 'vitD', headerX: 591, minX: 582, maxX: 602 },
  { field: 'tsh', headerX: 612, minX: 602, maxX: 624 },
  { field: 'hba1c', headerX: 633, minX: 624, maxX: 654 },
  { field: 't4', headerX: 662, minX: 654, maxX: 672 },
  { field: 'na', headerX: 679, minX: 672, maxX: 700 },
  { field: 'hbsag', headerX: 709, minX: 700, maxX: 735 },
  { field: 'antiHbs', headerX: 740, minX: 735, maxX: 755 },
  { field: 'antiHcv', headerX: 762, minX: 755, maxX: 780 },
  { field: 'hiv', headerX: 785, minX: 780, maxX: 810 }
];

function norm(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

function slugify(name) {
  return 'paciente-' + norm(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseValue(valStr, field) {
  if (!valStr) return null;
  const s = valStr.trim();
  if (['hbsag', 'antiHbs', 'antiHcv', 'hiv'].includes(field)) {
    return s;
  }
  const clean = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? s : n;
}

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    let y = parts[2];
    if (y.length === 2) y = '20' + y;
    const m = parts[1].padStart(2, '0');
    const d = parts[0].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

async function extractAllData() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  const parsedPatients = PATIENTS.map(name => ({
    nome: name,
    historicoExames: []
  }));

  let patientIdx = 0;

  for (let pageNum = 1; pageNum <= 6; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items
      .map(it => ({ str: it.str.trim(), x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) }))
      .filter(it => it.str.length > 0 && it.y < 470 && it.y > 40);

    const lines = [];
    items.forEach(it => {
      let line = lines.find(l => Math.abs(l.y - it.y) <= 3);
      if (!line) {
        line = { y: it.y, items: [] };
        lines.push(line);
      }
      line.items.push(it);
    });

    lines.sort((a, b) => b.y - a.y);

    for (const line of lines) {
      const nameItems = line.items.filter(it => it.x < 65).map(it => it.str).join(' ').trim();
      const dateItem = line.items.find(it => it.x >= 65 && it.x <= 92 && /^\d{2}\/\d{2}\/\d{2}$/.test(it.str));

      // Advance patient if next name matches
      if (nameItems.length > 0 && patientIdx + 1 < PATIENTS.length) {
        const nextPatFirstWord = norm(PATIENTS[patientIdx + 1]).split(' ')[0];
        const normLineName = norm(nameItems);
        if (normLineName.startsWith(nextPatFirstWord)) {
          patientIdx++;
        }
      }

      if (dateItem) {
        const dateIso = parseDate(dateItem.str);
        const examRecord = { dataExame: dateIso };

        line.items.forEach(it => {
          if (it.x < 90) return;
          const col = COLUMN_DEFS.find(c => it.x >= c.minX && it.x < c.maxX);
          if (col) {
            examRecord[col.field] = parseValue(it.str, col.field);
          }
        });

        parsedPatients[patientIdx].historicoExames.push(examRecord);
      }
    }
  }

  return parsedPatients;
}

async function main() {
  console.log('================================================================================');
  console.log('🔄 IMPORTAÇÃO SALÃO 3 - 2º TURNO (SEG/QUA/SEX) - DRA. MARIA TEREZA');
  console.log('================================================================================');

  const parsedPatients = await extractAllData();
  console.log(`Pacientes parseados do PDF: ${parsedPatients.length}`);

  let totalExamsCount = 0;
  let savedCount = 0;

  for (let i = 0; i < parsedPatients.length; i++) {
    const p = parsedPatients[i];
    const patId = slugify(p.nome);

    // Agrupar múltiplos lançamentos da mesma data caso ocorram e ordenar decrescente
    // (no mapa, alguns exames como sorologia ou fósforo ocorrem na mesma data em linhas diferentes ou em datas consecutivas)
    // Ordenar da mais recente para a mais antiga
    const sortedExams = [...p.historicoExames].sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame));
    totalExamsCount += sortedExams.length;

    // Consolidar último exame para cada parâmetro
    const exames = {};
    const examesDatas = {};

    sortedExams.forEach(item => {
      for (const [key, val] of Object.entries(item)) {
        if (key === 'dataExame' || val === null || val === undefined || val === '') continue;
        if (!exames[key]) {
          exames[key] = val;
          examesDatas[key] = item.dataExame;
        }
      }
    });

    // Se fa existir, também popular fosfAlcalina
    if (exames.fa && !exames.fosfAlcalina) {
      exames.fosfAlcalina = exames.fa;
      examesDatas.fosfAlcalina = examesDatas.fa;
    }

    const patientDoc = {
      id: patId,
      nome: p.nome,
      doctorId: 'dra-maria-tereza',
      activeTenantId: 'dra-maria-tereza',
      clinica: 'DialiZe Betim',
      hospital: 'HOSPITAL PUBLICO REGIONAL PREF. OSVALDO REZENDE FRANCO',
      localAtendimento: 'Salão 3',
      sala: 'Salão 3',
      andar: 'Salão 3',
      turno: '2º Turno',
      diaSemana: 'Seg/Qua/Sex',
      modalidade: 'HD',
      tipoPaciente: 'Crônico',
      convenio: 'SUS',
      status: 'Ativo',
      statusTransplante: 'Não Avaliado',
      tipoAcesso: 'FAV',
      posicaoAcesso: 'MSE',
      acessoVascular: {
        tipo: 'FAV',
        ladoMembro: 'MSE',
        fluxoSangue: 350,
        fluxoDialisato: 500,
        agulha: '16G',
        duracaoSessao: '04:00'
      },
      anticoagulacao: {
        tipo: 'heparina_padrao',
        doseAtaque: 1000,
        doseManutencao: 500,
        observacoes: 'Heparinização padrão.'
      },
      duracaoSessao: '04:00',
      prescricaoDialise: {
        tempoSessao: '04:00',
        duracaoHoras: 4.0,
        composicaoBanho: 'Padrão',
        tipoEsterilizacao: 'Padrão',
        frequenciaSemanal: '3x por semana',
        diasSemana: 'Seg/Qua/Sex',
        fluxoSangue: 350,
        fluxoDialisato: 500
      },
      etiologiaDRC: 'Doença renal em estágio final',
      observacoesClinicas: 'Paciente cadastrado via Mapa de Exames DialiZe Betim (Salão 3, 2º Turno, Seg/Qua/Sex). Período 01/07/2026 a 30/11/2026.',
      alergias: [],
      medicamentos: [],
      historicoExames: sortedExams,
      exames,
      examesDatas,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    await setDoc(doc(db, 'patients', patId), patientDoc, { merge: true });
    savedCount++;
    console.log(`✅ [${savedCount}/30] Salvo: ${p.nome} (ID: ${patId}) com ${sortedExams.length} exames`);
  }

  // Atualizar contador no documento do médico
  const qDraAll = query(collection(db, 'patients'), where('doctorId', '==', 'dra-maria-tereza'));
  const snapDraAll = await getDocs(qDraAll);
  const totalDraPatients = snapDraAll.size;

  await updateDoc(doc(db, 'doctors', 'dra-maria-tereza'), {
    pacientesCount: totalDraPatients,
    atualizadoEm: new Date().toISOString()
  });

  console.log('================================================================================');
  console.log(`🎉 Sucesso absoluto! ${savedCount} pacientes importados com ${totalExamsCount} exames.`);
  console.log(`📊 Total de pacientes da Dra. Maria Tereza agora: ${totalDraPatients}`);
  console.log('================================================================================');
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erro na importação:", err);
  process.exit(1);
});
