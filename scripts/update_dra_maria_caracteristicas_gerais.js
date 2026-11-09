import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  getDoc,
  collection, 
  query, 
  where, 
  getDocs 
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
const db = getFirestore(app);

const DOCTOR_ID = "dra-maria-tereza";

// 30 Pacientes do Relatório Características Gerais (Sistema Dialsist Web)
export const DADOS_CARACTERISTICAS_GERAIS = [
  {
    nome: "ADELINA FERREIRA DE ALMEIDA PEREIRA",
    cpf: "369.434.362-87",
    sexo: "F",
    dataNascimento: "1962-05-01",
    idade: 64,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ADELMARIA ALVES PEREIRA SILVA",
    cpf: "068.638.836-43",
    sexo: "F",
    dataNascimento: "1967-03-26",
    idade: 59,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-04-15",
    dataInicioDialise: "2013-01-01",
    tempoTratamentoAtual: "14m13d",
    tempoNaClinica: "19m16d",
    tempoTotalTratamento: "166m29d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-09-17",
      tempo: "14m13d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "APD",
      dataInicio: "2025-04-15",
      tempo: "19m16d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2013-01-01",
      tempoTotal: "166m29d"
    }
  },
  {
    nome: "ANTONIA GILDETE ALVES LOPES",
    cpf: "038.422.833-00",
    sexo: "F",
    dataNascimento: "1989-06-02",
    idade: 37,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ANTONIO VICENTE DE JESUS",
    cpf: "660.720.426-00",
    sexo: "M",
    dataNascimento: "1960-10-02",
    idade: 66,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "BRUNO XAVIER DE SOUZA",
    cpf: "065.810.286-90",
    sexo: "M",
    dataNascimento: "1984-01-21",
    idade: 42,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "CAMILA FARIA MACIEL",
    cpf: "081.107.136-70",
    sexo: "F",
    dataNascimento: "1988-02-03",
    idade: 38,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "CLAUDIA DUARTE DOS SANTOS",
    cpf: "089.513.126-90",
    sexo: "F",
    dataNascimento: "1986-07-30",
    idade: 40,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "EDUARDO LEANDRO GONCALVES",
    cpf: "037.071.666-35",
    sexo: "M",
    dataNascimento: "1979-08-18",
    idade: 47,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-11-14",
    dataInicioDialise: "2025-10-27",
    tempoTratamentoAtual: "12m16d",
    tempoNaClinica: "12m16d",
    tempoTotalTratamento: "13m3d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-11-14",
      tempo: "12m16d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-11-14",
      tempo: "12m16d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-10-27",
      tempoTotal: "13m3d"
    }
  },
  {
    nome: "ELIANE APARECIDA FERREIRA",
    cpf: "034.667.426-33",
    sexo: "F",
    dataNascimento: "1972-05-26",
    idade: 54,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ELIANE ARAUJO DA SILVA BENTO",
    cpf: "036.279.226-70",
    sexo: "F",
    dataNascimento: "1977-11-09",
    idade: 49,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ELIAS VIEIRA DA SILVA",
    cpf: "667.722.306-04",
    sexo: "M",
    dataNascimento: "1967-08-19",
    idade: 59,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ELIENE FREITAS ALMEIDA DE SOUSA",
    cpf: "127.506.776-02",
    sexo: "F",
    dataNascimento: "1991-10-10",
    idade: 35,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2026-07-30",
    dataInicioDialise: "2026-06-30",
    tempoTratamentoAtual: "4m1d",
    tempoNaClinica: "4m1d",
    tempoTotalTratamento: "5m1d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2026-07-30",
      tempo: "4m1d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2026-07-30",
      tempo: "4m1d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2026-06-30",
      tempoTotal: "5m1d"
    }
  },
  {
    nome: "EXPEDITO BASTOS",
    cpf: "522.385.986-34",
    sexo: "M",
    dataNascimento: "1947-05-11",
    idade: 79,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "GABRIELY PEREIRA DIAS",
    cpf: "021.411.266-73",
    sexo: "F",
    dataNascimento: "1999-02-19",
    idade: 27,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "GERALDO LUIZ DA SILVA",
    cpf: "520.288.956-91",
    sexo: "M",
    dataNascimento: "1952-05-21",
    idade: 74,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "IZENILCE BATISTA BORGES",
    cpf: "761.770.256-68",
    sexo: "F",
    dataNascimento: "1963-12-05",
    idade: 62,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "JEOZADAQUE JUNIO PEREIRA DIAS",
    cpf: "114.313.716-70",
    sexo: "M",
    dataNascimento: "1993-09-02",
    idade: 33,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "JESIO DE JESUS RIBEIRO",
    cpf: "099.417.526-48",
    sexo: "M",
    dataNascimento: "1989-08-30",
    idade: 37,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2022-10-12",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "49m19d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2022-10-12",
      tempoTotal: "49m19d"
    }
  },
  {
    nome: "JESUS DOS SANTOS DE PAULO",
    cpf: "664.505.946-91",
    sexo: "M",
    dataNascimento: "1966-01-13",
    idade: 60,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "JORGE SALVIANO FILHO",
    cpf: "953.158.886-49",
    sexo: "M",
    dataNascimento: "1969-08-01",
    idade: 57,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "MARLON FELICIO DOS SANTOS",
    cpf: "103.837.536-35",
    sexo: "M",
    dataNascimento: "1991-12-16",
    idade: 34,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "ODETE DIAS",
    cpf: "026.689.016-42",
    sexo: "F",
    dataNascimento: "1952-08-28",
    idade: 74,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "OLGA MARIA ALMEIDA FIGUEIREDO",
    cpf: "907.710.366-04",
    sexo: "F",
    dataNascimento: "1965-01-22",
    idade: 61,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "PAULO SILVINO AMBROZIO",
    cpf: "710.501.916-68",
    sexo: "M",
    dataNascimento: "1967-09-28",
    idade: 59,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "REGINA PATRICIA SOUZA NASCIMENTO",
    cpf: "062.113.076-16",
    sexo: "F",
    dataNascimento: "1982-10-08",
    idade: 44,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2026-02-09",
    dataInicioDialise: "2026-02-09",
    tempoTratamentoAtual: "9m20d",
    tempoNaClinica: "9m20d",
    tempoTotalTratamento: "9m20d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2026-02-09",
      tempo: "9m20d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2026-02-09",
      tempo: "9m20d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2026-02-09",
      tempoTotal: "9m20d"
    }
  },
  {
    nome: "SILMA FERREIRA DE SOUZA",
    cpf: "092.356.486-10",
    sexo: "F",
    dataNascimento: "1967-06-02",
    idade: 59,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "SOLANGE RODRIGUES CALDEIRA DE SA",
    cpf: "080.919.686-71",
    sexo: "F",
    dataNascimento: "1979-12-09",
    idade: 46,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "SONIA MARIA MOREIRA",
    cpf: "502.441.836-00",
    sexo: "F",
    dataNascimento: "1963-08-08",
    idade: 63,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  },
  {
    nome: "VALERIA PEREIRA DA SILVA",
    cpf: "051.810.456-77",
    sexo: "F",
    dataNascimento: "1980-09-29",
    idade: 46,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-05-02",
    dataInicioDialise: "2025-03-01",
    tempoTratamentoAtual: "18m29d",
    tempoNaClinica: "18m29d",
    tempoTotalTratamento: "20m30d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-05-02",
      tempo: "18m29d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-05-02",
      tempo: "18m29d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-03-01",
      tempoTotal: "20m30d"
    }
  },
  {
    nome: "VILMA SOARES DE MEDEIROS",
    cpf: "385.012.366-91",
    sexo: "F",
    dataNascimento: "1953-11-27",
    idade: 73,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doença renal em estágio final",
    convenio: "SUS",
    modalidade: "HD",
    dataInicioClinica: "2025-01-01",
    dataInicioDialise: "2025-01-01",
    tempoTratamentoAtual: "22m28d",
    tempoNaClinica: "22m28d",
    tempoTotalTratamento: "22m28d",
    tratamentoAtual: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d",
      convenio: "SUS"
    },
    inicioClinica: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempo: "22m28d"
    },
    primeiroTratamento: {
      modalidade: "HD",
      dataInicio: "2025-01-01",
      tempoTotal: "22m28d"
    }
  }
];

function generatePatientId(nome) {
  const clean = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `paciente-${clean}`;
}

async function updatePatientsData() {
  console.log("================================================================================");
  console.log("🔄 ATUALIZANDO DADOS CLÍNICOS E TEMPOS DE DIÁLISE - DRA. MARIA TEREZA");
  console.log("================================================================================");

  // Buscar todos os pacientes atuais da Dra. Maria Tereza
  const q = query(collection(db, 'patients'), where('doctorId', '==', DOCTOR_ID));
  const snap = await getDocs(q);
  console.log(`Pacientes cadastrados no Firestore: ${snap.size}`);

  const patientsMap = new Map();
  snap.forEach(d => {
    const data = d.data();
    // Chave por ID e também por CPF
    patientsMap.set(d.id, { id: d.id, ...data });
    if (data.cpf) {
      const cleanCpf = data.cpf.replace(/\D/g, '');
      if (cleanCpf) patientsMap.set(cleanCpf, { id: d.id, ...data });
    }
  });

  let updatedCount = 0;
  const now = new Date().toISOString();

  for (const item of DADOS_CARACTERISTICAS_GERAIS) {
    const expectedId = generatePatientId(item.nome);
    const cleanCpf = item.cpf.replace(/\D/g, '');

    const existing = patientsMap.get(expectedId) || patientsMap.get(cleanCpf);

    if (!existing) {
      console.warn(`⚠️ Paciente não encontrado no banco: ${item.nome} (CPF: ${item.cpf})`);
      continue;
    }

    const docId = existing.id;
    const docRef = doc(db, 'patients', docId);

    const updatePayload = {
      tipoPaciente: item.tipoPaciente,
      etiologiaDRC: item.etiologiaDRC,
      convenio: item.convenio,
      modalidade: item.modalidade,
      dataInicioClinica: item.dataInicioClinica,
      dataInicioDialise: item.dataInicioDialise,
      tempoTratamentoAtual: item.tempoTratamentoAtual,
      tempoNaClinica: item.tempoNaClinica,
      tempoTotalTratamento: item.tempoTotalTratamento,
      tratamentoAtual: item.tratamentoAtual,
      inicioClinica: item.inicioClinica,
      primeiroTratamento: item.primeiroTratamento,
      atualizadoEm: now
    };

    await updateDoc(docRef, updatePayload);
    updatedCount++;
    console.log(`✅ [${updatedCount}/30] Atualizado: ${item.nome} -> Início TRS: ${item.dataInicioDialise} (${item.tempoTotalTratamento}) | Clínica: ${item.dataInicioClinica} (${item.tempoNaClinica})`);
  }

  console.log("================================================================================");
  console.log(`🎉 Sucesso! ${updatedCount} pacientes atualizados com informações completas.`);
  console.log("================================================================================");
}

updatePatientsData().then(() => process.exit(0)).catch(console.error);

