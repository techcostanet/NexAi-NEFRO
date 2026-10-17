# Propostas Estratégicas de Inteligência Artificial — NexAi-NEFRO

Este documento consolida a análise técnica e clínica de oportunidades para incorporação de Inteligência Artificial no **NexAi-NEFRO**, com foco em redução de tempo do médico, eliminação de sobrecarga burocrática e prevenção de desfechos graves em hemodiálise.

---

## 🎯 Filosofia de I.A no NexAi-NEFRO
> *"A I.A médica não deve ser um chatbot genérico para enfeite. Ela precisa resolver um gargalo real da rotina do nefrologista onde haja cansaço cognitivo, repetição manual de dados ou risco de glosa administrativa."*

---

## 🧠 As 4 Grandes Frentes de I.A com Alto Impacto Clínico

### `1` — Ronda por Voz (Ditado & Estruturação Automática de Sessão)
* **O Problema Real:** Durante a ronda nas máquinas de diálise, o nefrologista avalia 20 a 30 pacientes por turno, muitas vezes em pé, calçado de luvas e sem condições ergonômicas de digitar em teclado ou celular.
* **A Solução:** Um botão de microfone na tela de evolução rápida da sessão. O médico segura e fala naturalmente por 15 a 20 segundos:
  > *"Dona Amélia hoje assintomática, sem queixas de câimbras. PA final 130x80, atingiu o peso seco de 64,5 kg com UF de 2.200 mL. Fístula rádio-cefálica com bom frêmito, sem edema ou hematoma. Manter parâmetros e reduzir a eritropoietina para 2 vezes por semana porque a hemoglobina bateu 12,6 g/dL."*
* **Processamento pela I.A:**
  - Extrai e preenche os campos formais:
    - `PA Pós`: 130x80 mmHg
    - `Peso Pós`: 64.5 kg
    - `UF Retirada`: 2.200 mL
    - `Intercorrências`: Nenhuma
    - `Acesso Vascular`: FAV íntegra, bom frêmito
    - `Conduta`: Ajuste posológico de EPO para 2x/sem devido a Hb 12.6
* **Impacto Comercial & Clínico:**
  - Reduz o tempo de ronda em mais de 50%.
  - O médico não encosta as mãos em computadores contaminados do salão.
  - Fator "UAU" imediato para demonstrações de vendas.

---

### `2` — Copiloto de Decisão Terapêutica (KDIGO / SBN em Tempo Real)
* **O Problema Real:** Mensalmente, chegam os exames laboratoriais do turno inteiro. Cruzar valores de 60 a 100 pacientes (PTH, Fósforo, Cálcio corrigido, Hemoglobina, Ferritina, IST, Kt/V) exige dezenas de checagens mentais complexas.
* **A Solução:** Um assistente clínico em tempo real integrado ao prontuário do paciente:
  - ⚠️ **Alerta de Anemia:** *"Hemoglobina subiu de 9,4 para 12,8 g/dL em 30 dias (+36%). Diretriz KDIGO sugere reduzir dose de Alfaepoetina em 25% a 50% para mitigar risco cardiovascular e trombose de acesso."*
  - ⚠️ **Alerta de Metabolismo Ósseo (DMO):** *"PTH em 850 pg/mL com Fósforo em 7,2 mg/dL. Produto Ca x P elevado (65,5 mg²/dL²). Priorizar controle dietético e quelante antes de introduzir ou elevar análogos de Vitamina D."*
  - ℹ️ **Alerta de Estoque Férrico:** *"Ferritina em 620 ng/mL com IST de 33%. Estoques de ferro adequados. Recomendado postergar novo ciclo de Sacarato Férrico (Noripurum)."*
* **Impacto Comercial & Clínico:**
  - Segurança médica absoluta: o médico continua no controle final, mas conta com uma "segunda checagem" automática que previne sobrecargas ou subdosagens.

---

### `3` — Redator Inteligente de Recursos e Justificativas de LME (Anti-Glosa SUS)
* **O Problema Real:** A burocracia do SUS / CEAF (Farmácia de Alto Custo) frequentemente indefere ou devolve pedidos de Cinacalcet, Paricalcitol ou Sevelamer exigindo *"relatório médico circunstanciado justificando falha terapêutica prévia ou contraindicações a terapias anteriores"*. Redigir esses pareceres consome de 20 a 30 minutos por paciente.
* **A Solução:** Botão **"Gerar Justificativa Circunstanciada com I.A"** dentro da aba LME:
  - A I.A lê o histórico do paciente no Firestore (ex.: paciente usou Calcitriol por 6 meses sem queda do PTH, desenvolveu hipercalcemia prévia ou tem produto Ca x P proibitivo).
  - Redige um texto técnico, robusto e formal de 2 parágrafos com referências ao PCDT do Ministério da Saúde.
* **Impacto Comercial & Clínico:**
  - Elimina o retrabalho de devoluções pelo SUS.
  - O nefrologista ganha horas de consultório e garante o medicamento de alto custo para o paciente renal crônico.

---

### `4` — Radar Preditivo de Falência de Acesso Vascular (FAV / Prótese / Permcath)
* **O Problema Real:** A estenose de fístula ou prótese arteriovenosa costuma ser insidiosa, ocorrendo ao longo de 2 a 4 meses. O olho humano muitas vezes não repara em pequenas quedas de fluxo de um mês para o outro, resultando em trombose súbita que obriga implante de cateter provisório de emergência.
* **A Solução:** Algoritmo de análise temporal de tendência nos parâmetros de sessão:
  - Se o fluxo de sangue efetivo (Qb) caiu progressivamente (ex.: 380 ➡️ 340 ➡️ 290 mL/min) ou se a pressão venosa da máquina subiu persistentemente:
  - 🚨 **Alerta Preventivo:** *"Tendência de perda progressiva de fluxo arterial (Qb reduzido em 24% nos últimos 90 dias). Sugerido agendamento de Eco-Doppler venoso de MSE para avaliar estenose de anastomose ou veia de drenagem antes da trombose."*
* **Impacto Comercial & Clínico:**
  - Salva o acesso vascular do paciente dialítico (o "patrimônio de vida" do renal crônico).
  - Reduz internações e custos hospitalares.

---

### `5` — Assistente de Comunicação Humanizada da Família (Boletim Lúdico)
* **O Problema Real:** Familiares e pacientes têm dúvidas frequentes sobre dieta e exames, consumindo tempo da equipe médica no WhatsApp ou na recepção da clínica.
* **A Solução:** Gerador empático de orientações personalizadas:
  - A partir dos exames do mês, a I.A sugere pequenas dicas nutricionais em linguagem leiga para serem enviadas pelo WhatsApp ou impressas no Boletim Visual (ex.: explicando de forma clara porque o fósforo subiu mesmo sem comer carne, alertando sobre embutidos e refrigerantes escuros).

---

## 📊 Matriz de Priorização (Esforço vs. Impacto)

| Funcionalidade de I.A | Impacto Clínico | Impacto de Vendas (UAU) | Complexidade Técnica | Prioridade Sugerida |
| :--- | :---: | :---: | :---: | :---: |
| **1. Ronda por Voz (Ditado Clínico)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Média (Whisper + Gemini) | **1º Lugar** |
| **2. Justificativa Anti-Glosa LME** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Baixa (Prompt com histórico) | **2º Lugar** |
| **3. Copiloto KDIGO / SBN** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Média (Rules engine + I.A) | **3º Lugar** |
| **4. Radar Preditivo de Acesso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Média-Alta (Análise temporal) | **4º Lugar** |
| **5. Assistente de Família (Boletim)** | ⭐⭐⭐ | ⭐⭐⭐ | Baixa (Texto humanizado) | **5º Lugar** |

---

## 🚀 Próximos Passos Recomendados
Quando for o momento de iniciar:
1. Começar pela **Ronda por Voz** ou pelo **Gerador de Justificativas LME** — ambas trazem retorno de tempo imediato no primeiro dia de uso.
2. Manter sempre o princípio da **autonomia médica**: a I.A sugere, mas o médico confirma ou edita com 1 clique antes de salvar no Firestore.
