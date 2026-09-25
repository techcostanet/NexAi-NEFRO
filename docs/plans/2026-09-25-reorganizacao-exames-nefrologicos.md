# Plano de Implementação: Reorganização e Aprimoramento dos Painéis de Exames Nefrológicos

> **Contexto:** Baseado nos feedbacks do médico/cliente e nas diretrizes clínicas da Sociedade Brasileira de Nefrologia (SBN) e KDIGO (2017/2023).

**Objetivo:** Reestruturar a categorização visual, o modal de lançamento de exames e a tabela de histórico laboratorial no NexAi-NEFRO, corrigindo o agrupamento de marcadores bioquímicos (FA e Albumina no DMO, Bicarbonato em Gasometria, remoção do PCR da Adequação, inclusão de Ureia Pré/Pós com cálculo de UR% e destaque à Hemoglobina Glicada).

---

## 🩺 1. Resumo das Alterações por Módulo

| Item Solicitado | Onde Impacta | Ação Prevista | Racional Nefrológico |
| :--- | :--- | :--- | :--- |
| **1. FA e Albumina no DMO** | `PatientProfile.jsx`, `ExamFormModal.jsx`, `examRanges.js` | Mover FA para o card DMO; calcular e exibir o **Cálcio Corrigido pela Albumina** no DMO ao lado do Cálcio Total. | A FA é marcador de turnover ósseo (alto vs baixo turnover). A Albumina é necessária para calcular o Cálcio Corrigido: $Ca_{\text{corr}} = Ca + 0{,}8 \times (4{,}0 - \text{Alb})$. |
| **2. Bicarbonato fora de Eletrólitos puros** | `PatientProfile.jsx`, `ExamFormModal.jsx` | Renomear o card para **"Eletrólitos & Gasometria"** (ou "Eletrólitos & Equilíbrio Ácido-Básico") e remover a FA que estava indevidamente aí. | Bicarbonato não deve ser excluído da clínica (acidose $HCO_3^- < 22$ desnutre e mata), mas pertencer ao contexto de equilíbrio ácido-básico/gasometria. |
| **3. PCR fora da Adequação Dialítica** | `PatientProfile.jsx`, `ExamFormModal.jsx` | Remover PCR de Adequação Dialítica e movê-la para o card **"Nutrição & Inflamação"** (Síndrome MIA). | PCR é marcador inflamatório e de infecção/cardiovascular, não dose de diálise. |
| **4. Kt/V + Ureia Pré e Pós na Adequação** | `PatientProfile.jsx`, `examRanges.js` | Exibir no card de Adequação: **Kt/V**, **Ureia Pré**, **Ureia Pós** e o cálculo automático da **Taxa de Redução de Ureia (UR%)**. | O trio Ureia Pré, Pós e Kt/V é o padrão-ouro de avaliação da dose de hemodiálise (meta Kt/V $\ge 1.20$, UR% $\ge 65\%$). |
| **5. Destacar Hemoglobina Glicada (HbA1c)** | `PatientProfile.jsx`, `examRanges.js` | Destacar HbA1c no card metabólico e adicionar na tabela histórica de exames com meta para DRC ($< 7{,}0\% - 8{,}0\%$). | 35-45% dos pacientes em diálise são diabéticos; HbA1c é parâmetro trimestral obrigatório de vigilância micro/macrovascular. |

---

## 🗂️ 2. Nova Arquitetura dos Cards de Exames (`PatientProfile.jsx`)

A tela de visualização de exames do paciente passará a ter **6 cards padronizados**:

1. **Card 1: Perfil de Anemia & Ferro**
   - Hemoglobina (Hb)
   - Hematócrito (Ht)
   - Índice de Sat. de Transferrina (IST)
   - Ferritina Sérica

2. **Card 2: Distúrbio Mineral e Ósseo (DMO)**
   - PTH Intacto (150 - 600 pg/mL)
   - Fósforo Sérico (3.5 - 5.5 mg/dL)
   - Cálcio Total (8.5 - 10.2 mg/dL)
   - **Cálcio Corrigido pela Albumina** (calculado automaticamente com tooltip explicativo)
   - Vitamina D (25-OH)
   - **Fosfatase Alcalina (FA)** (40 - 130 U/L) *(movida de Eletrólitos para cá)*

3. **Card 3: Adequação Dialítica & Cinética de Ureia**
   - **Kt/V Dialítico** ($\ge 1.20$)
   - **Ureia Pré-HD** (mg/dL)
   - **Ureia Pós-HD** (mg/dL)
   - **UR% (Taxa de Redução de Ureia)** (calculada: $[(U_{\text{pré}} - U_{\text{pós}}) / U_{\text{pré}}] \times 100$, meta $\ge 65\%$)

4. **Card 4: Eletrólitos & Gasometria**
   - Potássio ($K^+$) (3.5 - 5.5 mEq/L)
   - Sódio ($Na^+$) (135 - 145 mEq/L)
   - Bicarbonato Sérico / Reserva Alcalina ($HCO_3^-$) ($\ge 22$ mEq/L)

5. **Card 5: Nutrição & Marcadores Inflamatórios**
   - **Albumina Sérica** ($\ge 3.8$ g/dL)
   - **Proteína C Reativa (PCR)** ($< 5.0$ mg/L) *(retirada de Adequação Dialítica)*
   - **Creatinina Sérica** (mg/dL - indicador somático de massa muscular)

6. **Card 6: Controle Glicêmico & Perfil Hepático**
   - Glicemia de Jejum (70 - 130 mg/dL)
   - **Hemoglobina Glicada (HbA1c)** ($< 7.0\% - 8.0\%$) *(com destaque visual)*
   - TGP / ALT ($< 45$ U/L - Rastreio de hepatites)
   - TGO / AST ($< 35$ U/L)

---

## 🛠️ 3. Tarefas de Implementação Passo a Passo

### Tarefa 1: Atualizar Regras e Metas em `src/utils/examRanges.js`
- **Arquivos:** `src/utils/examRanges.js`
- **Ações:**
  1. Implementar avaliação clínica em `evaluateExam()` para:
     - `fa` / `fosfatasealcalina`: Normal (40 a 130 U/L), Atenção (131 a 200 U/L ou 30 a 39 U/L), Crítico (> 200 U/L ou < 30 U/L).
     - `hba1c` / `glicada`: Na meta ($\le 7.0\%$), Atenção (7.1% a 8.5%), Crítico (> 8.5% ou < 4.5%).
     - `ur` / `reducaoureia`: Na meta ($\ge 65\%$), Atenção (60% a 64%), Crítico (< 60%).
  2. Exportar função utilitária `calculateCorrectedCalcium(ca, albumina)`:
     ```javascript
     export function calculateCorrectedCalcium(ca, albumina) {
       const caNum = parseExamNumber(ca);
       const albNum = parseExamNumber(albumina);
       if (caNum === null || albNum === null) return null;
       const corrected = caNum + 0.8 * (4.0 - albNum);
       return parseFloat(corrected.toFixed(2));
     }
     ```
  3. Exportar função utilitária `calculateURR(ureiaPre, ureiaPos)`:
     ```javascript
     export function calculateURR(ureiaPre, ureiaPos) {
       const pre = parseExamNumber(ureiaPre);
       const pos = parseExamNumber(ureiaPos);
       if (!pre || !pos || pre <= 0) return null;
       const urr = ((pre - pos) / pre) * 100;
       return parseFloat(urr.toFixed(1));
     }
     ```

### Tarefa 2: Reestruturar os Cards e a Tabela em `src/pages/PatientProfile.jsx`
- **Arquivos:** `src/pages/PatientProfile.jsx`
- **Ações:**
  1. No bloco de cards de exames (linhas ~1960 a 2130):
     - **Card DMO:** Incluir `Fosf. Alcalina` (`exames.fa`) e exibir o `Cálcio Corrigido` quando houver Cálcio e Albumina.
     - **Card Eletrólitos & Gasometria:** Renomear o título; manter `Potássio`, `Sódio` e `Bicarbonato`; remover a `Fosf. Alcalina` dali.
     - **Card Adequação Dialítica:** Remover `PCR` e `Albumina`; adicionar `Ureia Pré`, `Ureia Pós` e `UR (%)`; manter `Kt/V`.
     - **Card Nutrição & Inflamação (Novo/Ajustado):** Reunir `Albumina`, `PCR` e `Creatinina`.
     - **Card Glicemia & Função Hepática:** Destacar `HbA1c` em conjunto com `Glicemia`.
  2. Na **Tabela de Histórico Laboratorial** (linhas ~2150 a 2230):
     - Atualizar as colunas do cabeçalho e corpo da tabela para refletir:
       - Adicionar coluna de `Kt/V (UR%)` ou `Ureia Pré/Pós`.
       - Adicionar coluna/subcoluna de `HbA1c`.
       - Adicionar `FA` na coluna de DMO junto com PTH.
       - Adicionar `HCO3` junto com Potássio.

### Tarefa 3: Reorganizar as Seções do Modal de Lançamento (`src/components/ExamFormModal.jsx`)
- **Arquivos:** `src/components/ExamFormModal.jsx`
- **Ações:**
  1. Garantir que o bloco de **DMO** tenha: PTH, Fósforo, Cálcio Total, Vitamina D e Fosfatase Alcalina.
  2. Ajustar o bloco de **Eletrólitos & Gasometria**: Potássio, Sódio, Bicarbonato (HCO3).
  3. Ajustar o bloco de **Adequação Dialítica**: Kt/V, Ureia Pré-HD, Ureia Pós-HD (com dica visual da fórmula da taxa de redução).
  4. Ajustar o bloco de **Nutrição & Inflamação**: Albumina Sérica, PCR e Creatinina.
  5. Ajustar o bloco de **Glicemia & Hepático**: Glicemia de Jejum, Hemoglobina Glicada (HbA1c), TGP, TGO.

### Tarefa 4: Teste de Validação e Consistência de Dados
- **Ações:**
  1. Testar o parser de números e os cálculos de Cálcio Corrigido e UR% com dados reais e nulos.
  2. Executar `npm run build` para garantir ausência de erros de build, sintaxe ou tipagem.
  3. Verificar se pacientes de teste em `src/data/demoPatients.js` exibem as novas informações perfeitamente.

### Tarefa 5: Deploy e Versionamento (Conforme AGENTS.md)
- **Ações:**
  1. Executar a rotina de release padronizada:
     - Atualização do `CHANGELOG.md` e incremento de versão SemVer.
     - Deploy no Firebase Hosting (`nexai-nefro.web.app`).
     - Commit e tag no repositório Git.

---

## ⏱️ Estimativa de Execução
- **Tempo estimado de execução:** Aproximadamente 25 a 35 minutos para codificação completa, testes e publicação.
