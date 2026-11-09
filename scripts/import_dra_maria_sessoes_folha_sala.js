import { db } from '../src/config/firebase.js';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

// Dados completos extraídos da Folha de Sala / Prontuário Médico (01/11/2026 a 30/11/2026) - DialiZe Betim
const SESSOES_DATA = [
  {
    nome: 'ARLETE APARECIDA ALBINO DA SILVA',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 64.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 67.5, pesoPos: 65.0, paPre: '114/63', paPos: '', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-03', pesoPre: 65.4, pesoPos: 63.2, paPre: '111/48', paPos: '125/71', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 64.6, pesoPos: 64.0, paPre: '90/50', paPos: '127/67', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 66.15, pesoPos: 63.5, paPre: '96/54', paPos: '126/66', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 66.6, pesoPos: 64.4, paPre: '145/62', paPos: '118/66', duracao: '03:40:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'MARLON FELICIO DOS SANTOS',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 61.8,
    sessoes: [
      { data: '2026-11-02', pesoPre: 65.1, pesoPos: 62.0, paPre: '177/116', paPos: '', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 64.1, pesoPos: 61.9, paPre: '163/112', paPos: '145/117', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 63.4, pesoPos: 61.8, paPre: '172/76', paPos: '150/85', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 65.0, pesoPos: 61.7, paPre: '177/116', paPos: '147/106', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'GABRIELY PEREIRA DIAS',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 67.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 71.9, pesoPos: 67.6, paPre: '208/112', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 78.85, pesoPos: 67.5, paPre: '176/116', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 70.9, pesoPos: 67.5, paPre: '174/100', paPos: '140/90', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 79.9, pesoPos: 67.7, paPre: '170/99', paPos: '151/88', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'OLGA MARIA ALMEIDA FIGUEIREDO',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 59.8,
    sessoes: [
      { data: '2026-11-02', pesoPre: 61.1, pesoPos: 59.8, paPre: '170/79', paPos: '136/98', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 60.7, pesoPos: 60.0, paPre: '196/77', paPos: '164/80', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 60.5, pesoPos: 59.8, paPre: '172/72', paPos: '153/72', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 60.9, pesoPos: 59.8, paPre: '170/70', paPos: '163/76', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'JORGE SALVIANO FILHO',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 45.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 47.5, pesoPos: 45.2, paPre: '150/82', paPos: '130/72', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 46.8, pesoPos: 45.0, paPre: '142/81', paPos: '158/70', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 46.3, pesoPos: 44.8, paPre: '145/70', paPos: '149/72', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 47.2, pesoPos: 44.9, paPre: '136/66', paPos: '147/69', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'PAULO SILVINO AMBROZIO',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 74.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 77.8, pesoPos: 74.5, paPre: '137/70', paPos: '138/74', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 76.7, pesoPos: 74.3, paPre: '138/68', paPos: '147/78', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 76.7, pesoPos: 74.7, paPre: '132/76', paPos: '146/77', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 77.5, pesoPos: 74.5, paPre: '133/81', paPos: '137/68', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ELIANE ARAUJO DA SILVA BENTO',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 78.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 81.5, pesoPos: 78.0, paPre: '146/94', paPos: '128/83', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 80.2, pesoPos: 78.0, paPre: '125/84', paPos: '122/67', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 81.0, pesoPos: 78.0, paPre: '126/71', paPos: '126/76', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 81.2, pesoPos: 78.0, paPre: '149/82', paPos: '130/75', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'IZENILCE BATISTA BORGES',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 55.2,
    sessoes: [
      { data: '2026-11-02', pesoPre: 58.0, pesoPos: 55.5, paPre: '157/89', paPos: '157/89', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 56.7, pesoPos: 55.45, paPre: '127/77', paPos: '161/84', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: 'Cãimbra' },
      { data: '2026-11-06', pesoPre: 56.5, pesoPos: 55.2, paPre: '113/74', paPos: '109/64', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 57.2, pesoPos: 55.1, paPre: '155/87', paPos: '143/93', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'SONIA MARIA MOREIRA',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 48.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 51.7, pesoPos: 49.0, paPre: '166/87', paPos: '179/93', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 51.5, pesoPos: 48.5, paPre: '162/86', paPos: '158/85', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 51.4, pesoPos: 48.5, paPre: '149/80', paPos: '127/71', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 51.4, pesoPos: 48.5, paPre: '167/82', paPos: '116/66', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ANTONIA GILDETE ALVES LOPES',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 52.9,
    sessoes: [
      { data: '2026-11-02', pesoPre: 56.4, pesoPos: 52.9, paPre: '147/88', paPos: '177/88', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 55.4, pesoPos: 52.9, paPre: '129/76', paPos: '129/79', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: 'Cãimbra' },
      { data: '2026-11-06', pesoPre: 55.6, pesoPos: 52.75, paPre: '159/95', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 56.5, pesoPos: 53.1, paPre: '161/95', paPos: '159/97', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'EXPEDITO BASTOS',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 73.15,
    sessoes: [
      { data: '2026-11-02', pesoPre: 74.8, pesoPos: 73.2, paPre: '148/60', paPos: '151/64', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 74.4, pesoPos: 73.15, paPre: '136/64', paPos: '158/65', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 75.6, pesoPos: 73.15, paPre: '145/54', paPos: '160/68', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'CLAUDIA DUARTE DOS SANTOS',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 74.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 79.0, pesoPos: 75.0, paPre: '161/96', paPos: '131/95', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 76.8, pesoPos: 73.4, paPre: '127/79', paPos: '112/60', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 77.4, pesoPos: 74.0, paPre: '127/78', paPos: '108/60', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 79.0, pesoPos: 75.0, paPre: '152/92', paPos: '163/86', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ELIANE APARECIDA FERREIRA',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 59.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 60.95, pesoPos: 58.9, paPre: '143/78', paPos: '144/77', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 60.1, pesoPos: 59.0, paPre: '177/86', paPos: '177/81', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 60.9, pesoPos: 58.2, paPre: '128/70', paPos: '141/57', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 61.0, pesoPos: 59.0, paPre: '147/74', paPos: '145/72', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'BRUNO XAVIER DE SOUZA',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 71.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 74.6, pesoPos: 71.1, paPre: '173/99', paPos: '150/107', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 73.5, pesoPos: 71.5, paPre: '134/84', paPos: '', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 74.0, pesoPos: 71.5, paPre: '159/89', paPos: '', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 75.0, pesoPos: 71.5, paPre: '148/88', paPos: '', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'JESUS DOS SANTOS DE PAULO',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 70.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 74.3, pesoPos: 71.0, paPre: '179/72', paPos: '208/79', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 73.7, pesoPos: 70.2, paPre: '180/78', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 73.2, pesoPos: 69.7, paPre: '192/93', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 74.0, pesoPos: 70.0, paPre: '171/74', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ADELINA FERREIRA DE ALMEIDA PEREIRA',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 30.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 31.1, pesoPos: 30.5, paPre: '158/70', paPos: '171/69', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 31.7, pesoPos: 30.6, paPre: '152/81', paPos: '147/78', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 31.5, pesoPos: 30.4, paPre: '161/77', paPos: '131/57', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 31.4, pesoPos: 30.3, paPre: '172/86', paPos: '158/64', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ANTONIO VICENTE DE JESUS',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 74.4,
    sessoes: [
      { data: '2026-11-02', pesoPre: 77.15, pesoPos: 74.4, paPre: '110/70', paPos: '122/78', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 76.7, pesoPos: 74.4, paPre: '148/72', paPos: '135/62', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 75.9, pesoPos: 74.0, paPre: '142/64', paPos: '121/74', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 77.0, pesoPos: 74.4, paPre: '183/91', paPos: '150/79', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'SOLANGE RODRIGUES CALDEIRA DE SA',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 43.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 45.3, pesoPos: 43.05, paPre: '136/50', paPos: '166/98', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 44.5, pesoPos: 42.9, paPre: '185/91', paPos: '169/92', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 46.1, pesoPos: 43.79, paPre: '175/102', paPos: '190/102', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 46.1, pesoPos: 43.15, paPre: '186/104', paPos: '180/104', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ODETE DIAS',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 64.4,
    sessoes: [
      { data: '2026-11-02', pesoPre: 67.1, pesoPos: 64.5, paPre: '140/71', paPos: '176/93', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 65.6, pesoPos: 64.4, paPre: '141/60', paPos: '136/47', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 65.7, pesoPos: 64.4, paPre: '146/79', paPos: '149/83', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 66.5, pesoPos: 64.2, paPre: '188/90', paPos: '194/65', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'GERALDO LUIZ DA SILVA',
    duracaoPadrao: '04:00',
    esterilizacao: 'Peróxido de ácido peracético',
    pesoSecoEstimado: 64.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 66.4, pesoPos: 65.5, paPre: '82/38', paPos: '81/49', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 66.4, pesoPos: 63.9, paPre: '148/66', paPos: '127/70', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 66.5, pesoPos: 64.9, paPre: '149/69', paPos: '131/63', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 67.5, pesoPos: 65.6, paPre: '141/73', paPos: '121/64', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' }
    ]
  },
  {
    nome: 'JEOZADAQUE JUNIO PEREIRA DIAS',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 64.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 69.8, pesoPos: 65.8, paPre: '140/88', paPos: '149/85', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 68.4, pesoPos: 64.4, paPre: '150/92', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 67.0, pesoPos: 64.5, paPre: '', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 66.5, pesoPos: 64.2, paPre: '139/81', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'VALERIA PEREIRA DA SILVA',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 50.2,
    sessoes: [
      { data: '2026-11-04', pesoPre: 53.0, pesoPos: 51.1, paPre: '189/99', paPos: '183/108', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 52.0, pesoPos: 50.0, paPre: '122/68', paPos: '174/91', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 50.5, pesoPos: 50.2, paPre: '99/59', paPos: '159/67', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: 'Cãimbra' }
    ]
  },
  {
    nome: 'ADELMARIA ALVES PEREIRA SILVA',
    duracaoPadrao: '03:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 69.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 71.0, pesoPos: 69.0, paPre: '120/56', paPos: '', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 71.0, pesoPos: 69.2, paPre: '98/56', paPos: '99/43', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 71.0, pesoPos: 69.0, paPre: '86/49', paPos: '102/62', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 71.1, pesoPos: 69.0, paPre: '100/59', paPos: '97/62', duracao: '03:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'TANIA APARECIDA MACHADO',
    duracaoPadrao: '03:40',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 59.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 61.6, pesoPos: 59.7, paPre: '159/72', paPos: '128/86', duracao: '03:40:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 61.8, pesoPos: 59.2, paPre: '131/66', paPos: '122/70', duracao: '03:40:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 61.5, pesoPos: 59.1, paPre: '149/70', paPos: '120/60', duracao: '03:40:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 62.4, pesoPos: 60.1, paPre: '161/66', paPos: '116/60', duracao: '03:40:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'REGINA PATRICIA SOUZA NASCIMENTO',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 58.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 62.55, pesoPos: 59.7, paPre: '131/77', paPos: '141/48', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 60.4, pesoPos: 58.7, paPre: '122/64', paPos: '146/75', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 60.25, pesoPos: 58.5, paPre: '112/60', paPos: '131/69', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 61.4, pesoPos: 58.5, paPre: '149/75', paPos: '106/44', duracao: '03:49:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'VILMA SOARES DE MEDEIROS',
    duracaoPadrao: '04:00',
    esterilizacao: 'Peróxido de ácido peracético',
    pesoSecoEstimado: 43.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 47.0, pesoPos: 44.0, paPre: '142/68', paPos: '100/49', duracao: '05:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 44.1, pesoPos: 43.0, paPre: '110/55', paPos: '101/64', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 44.3, pesoPos: 43.0, paPre: '83/45', paPos: '93/44', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 45.4, pesoPos: 42.9, paPre: '95/52', paPos: '87/47', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' }
    ]
  },
  {
    nome: 'SILMA FERREIRA DE SOUZA',
    duracaoPadrao: '03:30',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 51.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 53.0, pesoPos: 51.3, paPre: '146/69', paPos: '143/81', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 53.5, pesoPos: 51.7, paPre: '157/64', paPos: '172/76', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 53.5, pesoPos: 51.2, paPre: '165/72', paPos: '120/63', duracao: '03:30:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 54.8, pesoPos: 53.0, paPre: '160/59', paPos: '174/74', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ELIAS VIEIRA DA SILVA',
    duracaoPadrao: '04:00',
    esterilizacao: 'K 1 mEq/L com glicose',
    pesoSecoEstimado: 93.2,
    sessoes: [
      { data: '2026-11-02', pesoPre: 96.5, pesoPos: 93.2, paPre: '183/92', paPos: '152/96', duracao: '04:00:00', esterilizacao: 'K 1 mEq/L com glicose', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 96.5, pesoPos: 93.2, paPre: '145/78', paPos: '183/108', duracao: '04:00:00', esterilizacao: 'K 1 mEq/L com glicose', intercorrencias: '' },
      { data: '2026-11-07', pesoPre: 96.5, pesoPos: 93.18, paPre: '170/83', paPos: '160/90', duracao: '04:00:00', esterilizacao: 'K 1 mEq/L com glicose', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 96.7, pesoPos: 94.0, paPre: '218/100', paPos: '187/91', duracao: '04:00:00', esterilizacao: 'K 1 mEq/L com glicose', intercorrencias: '' }
    ]
  },
  {
    nome: 'CAMILA FARIA MACIEL',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 71.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 76.4, pesoPos: 72.6, paPre: '127/77', paPos: '130/75', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 75.0, pesoPos: 71.2, paPre: '128/80', paPos: '117/58', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 76.0, pesoPos: 72.3, paPre: '156/93', paPos: '150/83', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'ELIENE FREITAS ALMEIDA DE SOUSA',
    duracaoPadrao: '04:00',
    esterilizacao: 'Peróxido de ácido peracético',
    pesoSecoEstimado: 39.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 42.3, pesoPos: 39.6, paPre: '132/90', paPos: '177/89', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 41.5, pesoPos: 39.1, paPre: '148/40', paPos: '150/86', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 40.9, pesoPos: 39.7, paPre: '149/81', paPos: '163/75', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 40.7, pesoPos: 39.45, paPre: '136/87', paPos: '146/86', duracao: '04:00:00', esterilizacao: 'Peróxido de ácido peracético', intercorrencias: '' }
    ]
  },
  {
    nome: 'JESIO DE JESUS RIBEIRO',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 59.0,
    sessoes: [
      { data: '2026-11-02', pesoPre: 62.6, pesoPos: 59.5, paPre: '154/85', paPos: '166/93', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 63.5, pesoPos: 58.8, paPre: '', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 62.5, pesoPos: 59.0, paPre: '141/82', paPos: '135/78', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 62.7, pesoPos: 59.0, paPre: '152/84', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  },
  {
    nome: 'EDUARDO LEANDRO GONCALVES',
    duracaoPadrao: '04:00',
    esterilizacao: 'Padrão',
    pesoSecoEstimado: 70.5,
    sessoes: [
      { data: '2026-11-02', pesoPre: 75.5, pesoPos: 71.45, paPre: '201/97', paPos: '179/88', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-04', pesoPre: 74.6, pesoPos: 70.6, paPre: '216/93', paPos: '208/97', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-06', pesoPre: 74.1, pesoPos: 69.9, paPre: '223/106', paPos: '', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' },
      { data: '2026-11-09', pesoPre: 74.8, pesoPos: 70.9, paPre: '209/102', paPos: '203/96', duracao: '04:00:00', esterilizacao: 'Padrão', intercorrencias: '' }
    ]
  }
];

function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

async function main() {
  console.log('================================================================================');
  console.log('🔄 IMPORTAÇÃO DE FOLHA DE SALA / SESSÕES DE HEMODIÁLISE - DRA. MARIA TEREZA');
  console.log('================================================================================');

  // Buscar todos os pacientes atuais de Dra. Maria Tereza
  const qDra = query(collection(db, 'patients'), where('doctorId', '==', 'dra-maria-tereza'));
  const snapDra = await getDocs(qDra);
  const existingPatients = new Map();
  snapDra.forEach(d => {
    const data = d.data();
    existingPatients.set(normalize(data.nome), { id: d.id, ...data });
  });

  console.log(`Pacientes de Dra. Maria Tereza carregados: ${existingPatients.size}`);

  let updatedCount = 0;
  let createdCount = 0;

  for (const item of SESSOES_DATA) {
    const normName = normalize(item.nome);
    let patientRecord = existingPatients.get(normName);

    // Se o paciente não existir no cadastro da Dra. Maria Tereza, verificar se é Arlete ou Tania
    if (!patientRecord) {
      if (item.nome === 'ARLETE APARECIDA ALBINO DA SILVA') {
        const newId = 'paciente-arlete-aparecida-albino-da-silva';
        const newPatient = {
          id: newId,
          nome: item.nome,
          sexo: 'F',
          idade: 58,
          doctorId: 'dra-maria-tereza',
          activeTenantId: 'dra-maria-tereza',
          status: 'Ativo',
          tipoPaciente: 'Crônico',
          modalidade: 'HD',
          convenio: 'SUS',
          clinica: 'DialiZe Betim',
          hospital: 'HOSPITAL PUBLICO REGIONAL PREF. OSVALDO REZENDE FRANCO',
          turno: '1º Turno',
          diaSemana: 'Seg/Qua/Sex',
          tipoAcesso: 'FAV',
          posicaoAcesso: 'MSE',
          acessoVascular: {
            tipo: 'FAV',
            ladoMembro: 'MSE',
            fluxoSangue: 350,
            fluxoDialisato: 500,
            agulha: '16G',
            duracaoSessao: item.duracaoPadrao
          },
          anticoagulacao: {
            tipo: 'heparina_padrao',
            doseAtaque: 1000,
            doseManutencao: 500,
            observacoes: 'Heparinização padrão.'
          },
          statusTransplante: 'Não Avaliado',
          etiologiaDRC: 'Doença renal em estágio final',
          pesoSeco: item.pesoSecoEstimado,
          observacoesClinicas: 'Paciente cadastrado via Folha de Sala DialiZe Betim (Novembro/2026).',
          alergias: [],
          medicamentos: [],
          criadoEm: new Date().toISOString()
        };
        await setDoc(doc(db, 'patients', newId), newPatient);
        patientRecord = newPatient;
        createdCount++;
        console.log(`✨ Criado novo cadastro: ${item.nome} (ID: ${newId})`);
      } else if (item.nome === 'TANIA APARECIDA MACHADO') {
        // Verificar se existe Tania em doc-85719-mg e vincular para dra-maria-tereza
        const qTania = query(collection(db, 'patients'), where('nome', '==', 'TANIA APARECIDA MACHADO'));
        const snapTania = await getDocs(qTania);
        if (!snapTania.empty) {
          const tDoc = snapTania.docs[0];
          patientRecord = { id: tDoc.id, ...tDoc.data() };
          // Atualizar doctorId para permitir acesso no painel da Dra. Maria Tereza
          await updateDoc(doc(db, 'patients', tDoc.id), {
            doctorId: 'dra-maria-tereza',
            activeTenantId: 'dra-maria-tereza'
          });
          console.log(`🔗 Vinculado cadastro existente de Tania para Dra. Maria Tereza (ID: ${tDoc.id})`);
        }
      }
    }

    if (!patientRecord) {
      console.warn(`⚠️ Paciente não encontrado no banco: ${item.nome}`);
      continue;
    }

    // Montar histórico de pesagens a partir das sessões
    const pesoSecoRef = item.pesoSecoEstimado;
    const historicoPesos = [];

    // Ordenar sessões da mais recente para a mais antiga para historicoPesos
    const sessoesOrdenadas = [...item.sessoes].sort((a, b) => new Date(b.data) - new Date(a.data));

    sessoesOrdenadas.forEach((sess, idx) => {
      const pesoAferido = (sess.pesoPos && sess.pesoPos > 0) ? sess.pesoPos : sess.pesoPre;
      const ganho = parseFloat((sess.pesoPre - pesoSecoRef).toFixed(2));

      historicoPesos.push({
        id: `peso-${sess.data}-pos`,
        data: `${sess.data}T10:00:00`,
        peso: pesoAferido,
        tipo: (sess.pesoPos && sess.pesoPos > 0) ? 'Pós-HD' : 'Pré-HD',
        pesoPre: sess.pesoPre,
        pesoPos: sess.pesoPos,
        pa: sess.paPos || sess.paPre || '',
        paPre: sess.paPre || '',
        paPos: sess.paPos || '',
        pesoSecoReferencia: pesoSecoRef,
        ganhoInterdialitico: ganho,
        observacoes: sess.intercorrencias ? `Intercorrência: ${sess.intercorrencias}` : '',
        registradoEm: new Date().toISOString()
      });
    });

    // Último peso aferido é o da sessão mais recente
    const ultimoPeso = historicoPesos.length > 0 ? historicoPesos[0].peso : null;

    // Prescrição de diálise
    const prescricaoDialise = {
      tempoSessao: item.duracaoPadrao,
      duracaoHoras: parseFloat(item.duracaoPadrao.replace(':', '.')) || 4.0,
      composicaoBanho: item.esterilizacao,
      tipoEsterilizacao: item.esterilizacao,
      frequenciaSemanal: '3x por semana',
      diasSemana: patientRecord.diaSemana || 'Seg/Qua/Sex',
      fluxoSangue: patientRecord.acessoVascular?.fluxoSangue || 350,
      fluxoDialisato: patientRecord.acessoVascular?.fluxoDialisato || 500
    };

    // Acesso Vascular atualizado com duração
    const acessoVascular = {
      ...(patientRecord.acessoVascular || {}),
      duracaoSessao: item.duracaoPadrao,
      banho: item.esterilizacao
    };

    // Intercorrências registradas
    const intercorrenciasSessoes = item.sessoes
      .filter(s => s.intercorrencias && s.intercorrencias.trim() !== '')
      .map(s => `${s.intercorrencias} em ${s.data.split('-').reverse().join('/')}`);

    let obsClinicas = patientRecord.observacoesClinicas || '';
    if (intercorrenciasSessoes.length > 0) {
      const interTxt = `• Intercorrências intradialíticas recentes: ${intercorrenciasSessoes.join(', ')}.`;
      if (!obsClinicas.includes(interTxt)) {
        obsClinicas = obsClinicas ? `${obsClinicas}\n${interTxt}` : interTxt;
      }
    }

    // Atualizar no Firestore
    const updatePayload = {
      pesoSeco: item.pesoSecoEstimado,
      duracaoSessao: item.duracaoPadrao,
      prescricaoDialise,
      acessoVascular,
      historicoPesos,
      ultimoPesoAferido: ultimoPeso,
      sessoesDialise: item.sessoes,
      observacoesClinicas: obsClinicas,
      atualizadoEm: new Date().toISOString()
    };

    await updateDoc(doc(db, 'patients', patientRecord.id), updatePayload);
    updatedCount++;
    console.log(`✅ [${updatedCount}] Atualizado: ${patientRecord.nome} -> Duração: ${item.duracaoPadrao} | Banho: ${item.esterilizacao} | ${item.sessoes.length} sessões`);
  }

  console.log('================================================================================');
  console.log(`🎉 Sucesso! ${updatedCount} pacientes atualizados com dados completos de folha de sala.`);
  if (createdCount > 0) console.log(`✨ ${createdCount} novo paciente criado.`);
  console.log('================================================================================');
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Erro durante importação:", err);
  process.exit(1);
});
