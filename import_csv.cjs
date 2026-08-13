const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const accessFile = path.join(__dirname, 'Acesso 3 turno - Página1.csv');
const exames3File = path.join(__dirname, 'exames 3 turno - Página1.csv');
const exames2File = path.join(__dirname, 'planilha 2 turno - Página1.csv');

function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  }).data;
}

// Convert "8,2" to 8.2
function parsePtFloat(val) {
  if (!val || val === '—' || val === 'Em andamento') return null;
  if (typeof val === 'string') {
    // some values are >2.500 or have dots for thousands, e.g. "1.605,86"
    val = val.replace('>', '');
    val = val.replace(/\./g, '');
    val = val.replace(',', '.');
  }
  const floatVal = parseFloat(val);
  return isNaN(floatVal) ? null : floatVal;
}

function normalizeName(name) {
  if (!name) return '';
  return name.trim().toUpperCase();
}

async function run() {
  const acessoData = parseCSV(accessFile);
  
  // Notice: The first line of exames 3 is a subheader sometimes, so we might need to clean it up.
  // Actually, in exames 3, the real header is on line 2, line 1 is weird. Let's fix that by slicing or manually setting headers.
  let exames3Raw = fs.readFileSync(exames3File, 'utf8');
  exames3Raw = exames3Raw.split('\n').slice(1).join('\n'); // skip line 1
  const exames3Data = Papa.parse(exames3Raw, { header: true, skipEmptyLines: true }).data;

  const exames2Data = parseCSV(exames2File);

  const patientsMap = new Map();

  // Process Acessos
  acessoData.forEach(row => {
    const nome = normalizeName(row['Nome']);
    if (!nome) return;
    
    // Find first name for matching if full name is not present
    let patientObj = {
      id: nome.toLowerCase().replace(/\s+/g, '-'),
      nome: nome,
      turno: '3º Turno',
      acessoVascular: {
        tipo: (row['Acesso '] || '').trim(),
        fluxoSangue: parsePtFloat(row['Fluxo Sangue']),
        fluxoDialisato: parsePtFloat(row['Fluxo Dialisato']),
        agulha: (row['Agulha'] || '').trim()
      },
      exames: {},
      medicamentos: {}
    };
    patientsMap.set(nome.split(' ')[0], patientObj);
  });

  // Process Exames 3o Turno
  exames3Data.forEach(row => {
    const nomeFull = normalizeName(row['Paciente']);
    if (!nomeFull) return;
    
    const firstName = nomeFull.split(' ')[0];
    
    let patientObj = patientsMap.get(firstName);
    if (!patientObj) {
      patientObj = {
        id: nomeFull.toLowerCase().replace(/\s+/g, '-'),
        nome: nomeFull,
        turno: '3º Turno',
        acessoVascular: { tipo: 'Não informado', fluxoSangue: null, fluxoDialisato: null, agulha: '' },
        exames: {},
        medicamentos: {}
      };
      patientsMap.set(firstName, patientObj);
    } else {
      // update with full name
      patientObj.nome = nomeFull;
      patientObj.id = nomeFull.toLowerCase().replace(/\s+/g, '-');
    }

    patientObj.exames = {
      hb: parsePtFloat(row['Hb']),
      ist: parsePtFloat(row['IST (%)']),
      ferritina: parsePtFloat(row['Ferritina']),
      pth: parsePtFloat(row['PTH']),
      fosforo: parsePtFloat(row['Fósforo']),
      ca: parsePtFloat(row['Ca']),
      vitD: parsePtFloat(row['Vit. D'] || row['Vit.D'])
    };
    patientObj.medicamentos = {
      epo: row['EPO'] || '',
      nor: row['NOR'] || row['Nor'] || '',
      paricalcitol: row['Parical.'] || '',
      cinacalcete: row['Cinacalc.'] || row['Cinacal.'] || ''
    };
  });

  // Process Exames 2o Turno
  exames2Data.forEach(row => {
    const nomeFull = normalizeName(row['Paciente']);
    if (!nomeFull) return;
    if (nomeFull.includes('JACI ROCHA')) return; // empty row skip
    
    const patientObj = {
      id: nomeFull.toLowerCase().replace(/\s+/g, '-'),
      nome: nomeFull,
      turno: '2º Turno',
      acessoVascular: { tipo: 'Não informado', fluxoSangue: null, fluxoDialisato: null, agulha: '' },
      exames: {
        hb: parsePtFloat(row['Hb']),
        ist: parsePtFloat(row['IST (%)']),
        ferritina: parsePtFloat(row['Ferritina']),
        pth: parsePtFloat(row['PTH']),
        fosforo: parsePtFloat(row['Fósforo']),
        ca: parsePtFloat(row['Ca']),
        vitD: parsePtFloat(row['Vit. D'])
      },
      medicamentos: {
        epo: row['EPO'] || '',
        nor: row['Nor'] || '',
        paricalcitol: row['Parical.'] || '',
        cinacalcete: row['Cinacal.'] || '',
        sevelamer: row['Sevel.'] || '',
        caco3: row['CaCO₃'] || ''
      }
    };
    patientsMap.set(nomeFull.split(' ')[0], patientObj);
  });

  const finalPatients = Array.from(patientsMap.values());
  
  fs.writeFileSync(path.join(__dirname, 'src', 'data', 'patients_db.json'), JSON.stringify(finalPatients, null, 2));
  console.log('Criado patients_db.json com sucesso. Total:', finalPatients.length);
}

run();
