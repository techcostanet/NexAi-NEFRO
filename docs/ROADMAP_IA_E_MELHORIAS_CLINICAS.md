# 🗺️ Roadmap Unificado: Inteligência Artificial & Inovações Clínico-Assistenciais
### NexAi-NEFRO — Da Prescrição à Máquina de Hemodiálise

> **Status:** Documento Oficial de Referência Estratégica  
> **Versão:** 2.0 (Consolidação Unificada)  
> **Objetivo:** Cruzamento sinérgico entre inteligência artificial clínica, automação de rotinas assistenciais e segurança do paciente renal crônico.

---

## 🎯 1. Filosofia de Inovação no NexAi-NEFRO

> *"A tecnologia médica não deve ser um adorno estético nem um chatbot genérico. Ela precisa resolver um gargalo real da rotina do nefrologista e da equipe multidisciplinar onde haja cansaço cognitivo, repetição manual de dados, risco de infecção cruzada por contato ou risco de glosa administrativa."*

### Pilares Fundamentais:
1. **Autonomia Médica Inegociável:** A I.A calcula, prediz e sugere; o profissional médico revisa e homologa com 1 clique antes da persistência no Cloud Firestore.
2. **Ergonomia e Assepsia no Salão de Diálise:** Priorizar interfaces operáveis por voz ou com toques mínimos para reduzir o manuseio de teclados e celulares em ambientes estéreis/contaminados.
3. **Visão 360° do Acesso Vascular:** Integrar predição de estenose, acompanhamento cirúrgico e maturação de fístula em uma linha do tempo única.

---

## 🧠 2. Grandes Frentes de Inteligência Artificial Integrada

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MOTOR DE IA NEXAI-NEFRO                         │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  1. VOZ CLÍNICA  │  2. COPILOTO     │  3. ANTI-GLOSA   │  4. RADAR     │
│  (MÉDICA & ASSIST│     KDIGO/SBN    │     SUS (LME)    │     VASCULAR  │
└─────────┬────────┴─────────┬────────┴─────────┬────────┴───────┬───────┘
          │                  │                  │                │
          ▼                  ▼                  ▼                ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│ Estruturação de  ││ Alertas em Tempo ││ Redação Técnica  ││ Predição de      │
│ Sessão e Mural   ││ Real (DMO,       ││ Circunstanciada  ││ Falência e       │
│ de Comunicados   ││ Anemia, Ferro)   ││ PCDT/CEAF        ││ Tracker Maturação│
└──────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘
```

---

### Frente A — Ecossistema de Voz Clínica (Médico & Enfermagem)
*Fusão da Ronda Médica por Voz com o Ditado Assistencial de Mural*

* **O Problema:** Durante o turno (20 a 30 pacientes por médico/enfermeiro), o profissional atua em pé, com luvas de procedimento, sem condições de digitar em computadores compartilhados do salão.
* **A Solução Unificada:**
  1. **Ronda Médica de Máquina:** O nefrologista aciona o microfone e fala por 15 a 20 segundos à beira do leito:
     > *"Dona Amélia hoje assintomática, sem câimbras. PA final 130x80, atingiu o peso seco de 64,5 kg com UF de 2.200 mL. Fístula rádio-cefálica com bom frêmito, sem hematoma. Manter parâmetros e reduzir eritropoietina para 2x/semana porque Hb atingiu 12,6 g/dL."*
     - **Extração com IA:** Preenche automaticamente `PA Pós`, `Peso Pós`, `UF Retirada`, `Intercorrências: Nenhuma`, `FAV íntegra` e gera rascunho de conduta farmacológica.
  2. **Ditado de Comunicados & Intercorrências da Equipe:** No mural assistencial, a enfermagem dita ocorrências com reconhecimento nativo do vocabulário dialítico (*"ultrafiltração"*, *"bacteremia"*, *"fluxo de heparina"*, *"coagulação de capilar"*), com categorização e urgência sugeridas automaticamente.
* **Impacto:** Redução de >50% no tempo burocrático de anotações e redução drástica de infecção cruzada por fômites (teclados/mouses).

---

### Frente B — Copiloto de Decisão Terapêutica (Diretrizes KDIGO & SBN)
*Monitoramento analítico contínuo do painel laboratorial mensal*

* **O Problema:** A cada ciclo mensal de exames, o médico precisa cruzar dezenas de analitos (PTH, Ca, P, FA, Hb, Ferritina, IST, Kt/V) para 60 a 100 pacientes, exigindo cálculos mentais repetitivos e gerando risco de omissão.
* **A Solução:** Algoritmo clínico vigilante que dispara cards explicativos no prontuário:
  - 🩸 **Controle da Anemia:** Detecta ascensões bruscas de Hb (ex.: subida de 9,4 para 12,8 g/dL em 30 dias) e recomenda reduzir a dose de Alfaepoetina em 25% a 50%, prevenindo risco trombótico cardiovascular e perda de FAV.
  - 🦴 **Distúrbio Mineral e Ósseo (DMO):** Analisa o produto $Ca \times P$. Diante de PTH 850 pg/mL e P 7,2 mg/dL com produto $> 55\text{ mg}^2/\text{dL}^2$, alerta para priorizar quelante e dieta antes de introduzir ou elevar análogos de Vitamina D ativa (Calcitriol/Paricalcitol).
  - 💉 **Reposição Férrica:** Avalia simultaneamente Ferritina e IST, sugerindo suspender Noripurum se Ferritina $> 500\text{ ng/mL}$ ou IST $> 30\%$, evitando hemossiderose tecidual.
* **Impacto:** Prevenção ativa de eventos adversos e suporte de decisão sem tirar a soberania do nefrologista.

---

### Frente C — Redator Inteligente de Justificativas LME (Anti-Glosa SUS/CEAF)
*Automação de relatórios circunstanciados para medicamentos de alto custo*

* **O Problema:** Pedidos de Cinacalcete, Paricalcitol e Sevelamer na farmácia de alto custo do Estado são comumente devolvidos ou indeferidos por falta de comprovação textual de falha terapêutica ou intolerância aos fármacos de 1ª linha. Redigir cada relatório consome de 20 a 30 minutos.
* **A Solução:** Botão de 1 toque no painel de LME:
  - A I.A varre o prontuário do paciente no Firestore (histórico de hipercalcemia, níveis refratários de PTH sob calcitriol ou quelantes à base de cálcio).
  - Gera minuta médica detalhada em 2 parágrafos, citando o PCDT específico do Ministério da Saúde e as portarias vigentes.
* **Impacto:** Elimina indeferimentos e glosas, assegura o tratamento no SUS e devolve horas de atendimento clínico ao médico.

---

### Frente D — Ciclo 360° do Acesso Vascular (Predição + Maturação + Cirurgia)
*Conexão direta entre o Radar Preditivo de Falência e o Módulo de Agendamento Cirúrgico*

* **O Problema:** A estenose de acesso vascular costuma ser lenta e silenciosa. Quando o fluxo de bomba ($Qb$) cai mês a mês, a trombose frequentemente surpreende a equipe, forçando a passagem de cateter provisório de emergência. Paralelamente, fístulas novas sofrem punções prematuras por falta de controle de dias de pós-operatório.
* **A Solução Integrada:**
  1. **Radar Preditivo de Estenose:** Análise temporal em 90 dias dos parâmetros da máquina de diálise:
     - Queda persistente de $Qb$ (ex.: $380 \to 340 \to 280\text{ mL/min}$) combinada a aumento da Pressão Venosa da linha.
     - 🚨 **Alerta Precoce:** Sugere realização de Eco-Doppler de fístula ou fistulografia antes da oclusão definitiva.
  2. **Tracker de Maturação de Fístula (D+15, D+30, D+45, D+60):**
     - Cronômetro automático acionado quando a cirurgia é cadastrada como realizada.
     - Dispara aviso em D+30 para agendamento do Doppler de fluxo e no D+45 a D+60 para a primeira punção assistida em sala com supervisão.
  3. **Kanban Vascular Multidisciplinar:**
     - Quadro visual com 5 estágios: *1. Triagem/Indicação Vascular* ➔ *2. Exames Pré-Operatórios* ➔ *3. Agendada no Bloco* ➔ *4. Pós-Operatório & Maturação* ➔ *5. Acesso Apto & Liberado*.
  4. **Mapa Cirúrgico Diário Hospitalar (PDF):**
     - Exportação com folha timbrada da escala cirúrgica para o hospital conveniado, com tipo de anastomose, lateralidade (MSE/MSD), cirurgião, anestesista e profilaxia.
* **Impacto:** Preservação do patrimônio vascular do paciente (a "linha de vida" do renal crônico) e zero cirurgias canceladas por falta de materiais ou leito.

---

### Frente E — Assistente de Comunicação Humanizada (Boletim Lúdico)
*Ponte de comunicação transparente e empática com a família*

* **O Problema:** Familiares têm dificuldade de interpretar boletins técnicos e termos como "ureia", "kt/v" ou "fosfatemia", sobrecarregando a enfermagem e a recepção com dúvidas repetitivas.
* **A Solução:** Tradutor em linguagem leiga integrado ao Boletim de Saúde:
  - Explicações claras e empáticas (ex.: orientações sobre alimentos ricos em fósforo oculto, incentivo ao cumprimento do tempo de máquina, celebração visual quando as metas são atingidas).
  - Formato adaptado para envio direto via WhatsApp ou impressão com tipografia acessível.

---

## 📋 3. Melhorias Assistenciais & Operacionais (Mural e Fluxo de Equipe)

Além dos motores de IA generativa e preditiva, o sistema incorpora melhorias estruturais de workflow:

| Módulo | Funcionalidade | Descrição & Propósito |
| :--- | :--- | :--- |
| **Mural de Equipe** | **Fixar Comunicados Críticos (Pin)** | Permite fixar no topo avisos de surtos, precaução de contato ou normas sanitárias urgentes. |
| **Mural de Equipe** | **Passagem de Plantão Digital (SBAR)** | Checklist padronizado em 4 fases: Situação, Breve Histórico, Avaliação e Recomendações. |
| **Segurança** | **Alertas Sonoros & Notificações Pulsantes** | Sinalização suave e chamativa para eventos críticos: Óbito, Hemotransfusão ou Urgência Máxima. |
| **Logística Vascular**| **Gestão de Materiais Especiais** | Bloqueio preventivo caso a prótese de PTFE ou o cateter Permcath não estejam liberados em estoque. |
| **Governança** | **Notificação Cruzada Médico-Assistencial** | Notificação automática ao nefrologista quando seu paciente tiver intercorrência grave ou cirurgia confirmada. |

---

## 📊 4. Matriz de Priorização Integrada (Esforço vs. Retorno)

A ordenação prioriza as iniciativas com maior impacto imediato na rotina clínica e maior valor percebido pelo médico assinante:

| # | Iniciativa | Natureza | Impacto Clínico | Valor de Vendas (UAU) | Complexidade Técnica | Fase Recomendada |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: |
| **1** | **Ronda Médica por Voz** | IA Generativa | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Média | **Fase 1** |
| **2** | **Redator de Justificativa LME** | IA Especializada | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Baixa | **Fase 1** |
| **3** | **Passagem de Plantão SBAR & Fixar Avisos** | Workflow / UX | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Baixa | **Fase 1** |
| **4** | **Copiloto KDIGO / SBN** | Motor de Regras + IA | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Média | **Fase 2** |
| **5** | **Radar Preditivo de Falência de FAV** | IA Preditiva | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Média-Alta | **Fase 2** |
| **6** | **Tracker de Maturação & Kanban Vascular** | Workflow Clínico | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Média | **Fase 2** |
| **7** | **Assistente Humanizado da Família** | IA Educacional | ⭐⭐⭐ | ⭐⭐⭐ | Baixa | **Fase 3** |
| **8** | **Mapa Cirúrgico Hospitalar em PDF** | Exportação PDF | ⭐⭐⭐ | ⭐⭐⭐ | Baixa | **Fase 3** |

---

## 🛠️ 5. Diretrizes de Arquitetura e Engenharia

1. **Stack Tecnológica:**
   - Modelos de IA: **Google Gemini API** (via `@google/genai` ou Firebase AI Extensions) com baixa latência para transcrição de áudio e raciocínio clínico estruturado com JSON Schema.
   - Banco de Dados: **Google Cloud Firestore** (coleções estruturadas, listeners em tempo real, zero dependência de storage local).
   - Audio Engine: Web Audio API nativa do navegador para gravação de áudio compactada e envio seguro.
2. **Segurança & LGPD:**
   - O áudio é processado para inferência e descarte imediato; dados clínicos sensíveis são persistidos unicamente no Firestore sob as regras de segurança autenticadas.
3. **Padrão de UI Minimalista (Regra de Poucas Palavras):**
   - Botões acionadores com 1 única palavra (*Ditador*, *Justificar*, *Alertas*, *Kanban*, *Exportar*), sem caracteres duplos (`&` e `/`) em rótulos de navegação.

---
*Documento consolidado e mantido pela equipe de engenharia e produto do NexAi-NEFRO.*
