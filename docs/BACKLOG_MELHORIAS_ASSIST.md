# Backlog de Ideias e Futuras Melhorias — NexaASSIST (.assist)

Este documento registra as ideias concebidas durante a estruturação do módulo **NexaASSIST** para implementação em sprints futuras.

---

## 📢 MURAL DE COMUNICADOS

### `1` — Fixar Comunicados Críticos no Topo (Pin / Sticky Alerts)
- **Descrição**: Permitir que coordenadores e médicos fixem avisos de alta relevância no topo do feed (ex.: surtos infecciosos, protocolos de precaução de contato, auditorias sanitárias, desabastecimento de medicamentos ou condutas do dia).
- **Impacto Clínico**: Garante que comunicados que afetam a segurança de toda a clínica permaneçam visíveis e não fiquem soterrados por comunicados de rotina dos turnos.

### `2` — Passagem de Plantão Digital Guiada (Metodologia SBAR / Checklist de Turno)
- **Descrição**: Modal interativo estruturado em 4 etapas padronizadas da enfermagem hospitalar:
  1. **S (Situação)**: Censo do turno, intercorrências ativas e altas.
  2. **B (Breve Histórico)**: Pacientes que demandam vigilância especial (ex.: hipotensão severa, sangramento de FAV, reação pirogênica).
  3. **A (Avaliação)**: Condutas tomadas pelo médico ou enfermeiro do turno cessante.
  4. **R (Recomendações)**: Pendências para o turno entrante (ex.: coletar exames pós-diálise, administrar medicação faltante).
- **Impacto Clínico**: Continuidade assistencial perfeita e rastreabilidade com assinatura digital do profissional que entregou e de quem recebeu o plantão.

### `4` — Alertas Sonoros e Notificações Visuais Pulsantes em Tempo Real
- **Descrição**: Disparo de aviso sonoro suave (configurável e com opção de mutar) e tarja animada no topo da tela sempre que um comunicado classificado como *"Urgente"*, *"Óbito"* ou *"Hemotransfusão"* for publicado.
- **Impacto Clínico**: Resposta rápida da equipe assistencial e médica diante de situações de emergência no salão de hemodiálise.

### `5` — Ditado Clínico por Voz com IA (Speech-to-Text)
- **Descrição**: Botão com microfone no formulário de cadastro de comunicados que transcreve o áudio falado pelo profissional, reconhece termos da nefrologia (ex: "ultrafiltração", "heparina", "fístula", "bacteremia"), pontua o texto e sugere automaticamente a categoria e urgência.
- **Impacto Clínico**: Facilita o registro de intercorrências pela enfermagem com as mãos ocupadas ou calçadas com luvas.

---

## 🩺 AGENDAMENTO CIRÚRGICO VASCULAR

### `7` — Rastreador Clínico de Maturação de Fístula (Tracker D+15, D+30, D+45, D+60)
- **Descrição**: Cronômetro e linha do tempo de maturação iniciada automaticamente quando uma FAV é marcada como "Realizada". Emite avisos visuais no D+30 para agendamento do exame Duplex de controle de fluxo e no D+45 a D+60 para a liberação da primeira punção assistida pela enfermagem.
- **Impacto Clínico**: Prevenção de punções prematuras de FAV (causa número 1 de hematomas precoces e perda de fístula) e agilização da retirada de cateteres de duplo lúmen/Permcath.

### `9` — Controle e Alerta de Materiais Especiais (Prótese PTFE & Permcath)
- **Descrição**: Vinculação entre o agendamento cirúrgico e o estoque/almoxarifado da clínica, informando se a prótese de PTFE ou o cateter Permcath estão reservados, disponíveis em estoque ou aguardando liberação de operadora/SUS.
- **Impacto Clínico**: Eliminação de cirurgias canceladas na porta do bloco cirúrgico por indisponibilidade de insumos cirúrgicos caros.

### `11` — Modo de Visualização em Quadro Kanban Vascular
- **Descrição**: Visão tipo Kanban com cartões de arrastar e soltar organizados em colunas de esteira vascular:
  1. *Triagem / Indicação Vascular*
  2. *Exames Pré-Operatórios*
  3. *Agendadas no Bloco Cirúrgico*
  4. *Pós-Operatório & Maturação*
  5. *Acesso Apto & Concluído*
- **Impacto Clínico**: Panorama visual de 100% dos pacientes que estão em transição de acesso vascular na clínica.

### `12` — Mapa Cirúrgico Diário Formatado para o Bloco Cirúrgico (PDF Hospitalar)
- **Descrição**: Exportação formal de espelho cirúrgico em folha timbrada para encaminhamento ao Centro Cirúrgico do hospital conveniado, com ordem dos procedimentos, lateralidade (MSE/MSD), cirurgião responsável, anestesiologista e profilaxia antimicrobiana.
- **Impacto Clínico**: Padronização e profissionalismo na relação entre a clínica de nefrologia e o hospital cirúrgico parceiro.

---

## 🔗 INTEGRAÇÃO & INTELIGÊNCIA CLÍNICA

### `14` — Vínculo de Cirurgia com Notificação Direta ao Médico Nefrologista
- **Descrição**: Integração que notifica o médico nefrologista responsável pelo turno ou pelo prontuário sempre que uma cirurgia for agendada ou concluída para seu paciente, ou quando houver comunicado de urgência grave registrado no mural.
- **Impacto Clínico**: Fechamento do ciclo de comunicação entre a cirurgia vascular e a equipe médica do salão de diálise.
