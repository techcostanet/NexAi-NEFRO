# Registro de Mudanças (Changelog) - NexAi-NEFRO

Todas as alterações, melhorias e correções deste projeto são documentadas neste arquivo de forma cronológica e versionada.

## [1.1.24] - 2026-08-16
### Alterações
- Eliminação de loop de renderização em modais de pacientes e restauração completa da navegação do botão voltar

## [1.1.23] - 2026-08-16
### Alterações
- Correção do botão voltar ao painel de pacientes, remoção do termo Ronda de Hemodiálise e correção da abertura da edição de evolução clínica

## [1.1.22] - 2026-08-16
### Alterações
- Adiciona auto organizacao clicavel nas colunas da tabela e simplifica abas e cabecalhos para palavra unica

## [1.1.21] - 2026-08-16
### Alterações
- Ajuste de espacamento dos icones e simplificacao dos botoes superiores para palavra unica

## [1.1.20] - 2026-08-15
### Alterações
- Reformulacao completa do Prontuario com abas clinicas, exames balanceados e registro de evolucoes

## [1.1.19] - 2026-08-15
### Alterações
- Adiciona 3 modos de visualizacao, migra pacientes para Dialize Betim e simplifica rotulos do sistema

## [1.1.18] - 2026-08-15
### Alterações
- Corrige persistencia do currentUser no login e compatibilidade de senhas

## [1.1.17] - 2026-08-15
### Alterações
- Forca redirecionamento para login quando sem sessao e remove fallbacks visuais

## [1.1.16] - 2026-08-15
### Alterações
- Corrige tela de carregamento infinito do Auth

## [1.1.15] - 2026-08-15
### Alterações
- Corrige vazamento de sessao F5 e redesign locais de atuacao

## [1.1.14] - 2026-08-15
### Alterações
- Implementa edicao de locais de atuacao, pausa/desativacao sem perda de dados, registro de RT e contato de enfermagem no Firestore

## [1.1.13] - 2026-08-15
### Alterações
- Implementa gestao de multi-locais de atuacao medica (clinicas/hospitais), vinculo dinamico no cadastro de pacientes e filtro por unidade no dashboard

## [1.1.12] - 2026-08-15
### Alterações
- Implementa modernizacao completa do Painel Super Administrador: Modelo de licencas com CRM/CPF/Vigencia, metricas SaaS (MRR/ARR/Churn), auditoria de impersonacao no Firestore e seguranca sem senhas em tela

## [1.1.11] - 2026-08-15
### Alterações
- Corrige autenticacao na nuvem para suportar contas administrativas, medicas e Firestore com resiliencia total

## [1.1.10] - 2026-08-15
### Alterações
- Adequacao estrita para arquitetura 100% Cloud: integracao com Firebase Auth e Firebase Storage, remocao total de localStorage e eliminacao de persistencia JSON local

## [1.1.9] - 2026-08-15
### Alterações
- Ajusta subtítulo para Gestão Nefrológica e remove bloco de acessos rápidos da tela de login

## [1.1.8] - 2026-08-14
### Alterações
- Adiciona conta de demonstracao completa do Dr. Marcelo Ramos, gestao de medicos no Admin e pacientes clinicos de teste no Firestore

## [1.1.7] - 2026-08-14
### Alterações
- Remove campos redundantes de medicamentos do modal de exames e adiciona painel laboratorial nefrologico completo

## [1.1.6] - 2026-08-14
### Alterações
- Adiciona gestao dinamica de medicamentos com catalogo de dialise e alertas visuais de termino de ciclo

## [1.1.5] - 2026-08-14
### Alterações
- Adequacao terminologica para Notas de Versao e posicionamento centralizado no cabecalho

## [1.1.4] - 2026-08-14
### Alterações
- Melhoria de ergonomia visual no botao voltar, paleta de tons pasteis para quadros clinicos e modal interativo de evolucoes do sistema

## [1.1.3] - 2026-08-14
### Alterações
- Cadastro completo do médico, gestão de pacientes com dados clínicos e lançamento/edição de histórico de exames laboratoriais

## [1.1.2] - 2026-08-14
### Alterações
- Atualizacao de identidade visual: NexAi-NEFRO - Gestao Nefrologica, novo icone renal e versao 1.1.2 no login

## [0.1.2] - 2026-08-14
### Alterações
- Ajuste e validacao do pipeline de entrega continua

## [0.1.1] - 2026-08-14
### Alterações
- Implementação de regras de arquitetura, versionamento automático, changelog e sincronização com GitHub

## [0.1.0] - 2026-08-13
### Adicionado
- Integração completa com o **Firebase** e **Cloud Firestore** no projeto `nexai-nefro`.
- Carga de dados inicial de 53 pacientes com acessos vasculares, exames laboratoriais e medicamentos para a nuvem.
- Dashboard médico conectado em tempo real ao Firestore.
- Perfil detalhado de paciente com alertas de exames fora da meta (Hb < 10, PTH > 600).
- Publicação online no **Firebase Hosting** (`https://nexai-nefro.web.app`).
- Sistema de versionamento automático integrado ao ciclo de deploy e GitHub.
