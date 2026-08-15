# Regras e Diretrizes do Projeto NexAi-NEFRO

Este documento define o fluxo de trabalho obrigatório e os padrões arquiteturais para o desenvolvimento contínuo do **NexAi-NEFRO**.

---

## 🏛️ 1. Arquitetura 100% Cloud (Firebase & Cloud Firestore)

- **Backend & Banco de Dados**: Firebase Cloud Firestore — **SEM EXCEÇÕES**.
- **Autenticação**: Firebase Authentication (`firebase/auth`) gerenciando credenciais e sessões em nuvem.
- **Storage de Arquivos**: Firebase Storage (`firebase/storage`) para exames, anexos, laudos em PDF e fotos de perfil.
- **Hosting**: Firebase Hosting com CDN global de alta performance.
- **PROIBIDO TERMINANTEMENTE**:
  - ❌ `localStorage` / `sessionStorage`
  - ❌ `IndexedDB` / `WebSQL` / `SQLite`
  - ❌ Arquivos JSON locais para persistência de dados
- **Fonte única da verdade**: Toda leitura e escrita deve ocorrer diretamente nas coleções do **Cloud Firestore**.
- **Sincronização em Tempo Real**: Sempre priorizar listeners do Firestore (`onSnapshot`) para que atualizações feitas por médicos ou administradores sejam refletidas instantaneamente.

---

## 📁 2. Estrutura de Coleções do Cloud Firestore

O banco de dados do NexAi-NEFRO é organizado nas seguintes coleções principais:

### 1. `users` (Coleção de Usuários e Permissões)
*Document ID: UID do Firebase Auth*
- `uid`: string (Identificador único do Firebase Auth)
- `email`: string
- `role`: string (`'admin'` | `'doctor'`)
- `doctorId`: string (ID do documento correspondente na coleção `doctors`, ex: `'dr-marcelo'`)
- `nome`: string
- `criadoEm`: string (ISO 8601)
- `ultimoAcesso`: string (ISO 8601)

### 2. `doctors` (Coleção de Médicos e Licenças)
*Document ID: ID do Médico (ex: `dr-marcelo`, `dra-gisele`)*
- `id`: string
- `nome`: string
- `titulo`: string (ex: 'Médico Nefrologista & Intensivista')
- `crm`: string
- `ufCrm`: string (ex: 'SP')
- `rqe`: string
- `especialidade`: string
- `email`: string
- `telefone`: string
- `clinicaPrincipal`: string
- `hospitalVinculo`: string
- `unidadeDialise`: string
- `bio`: string
- `statusLicenca`: string (`'Ativo'` | `'Demonstração Ativa'` | `'Inativo'`)
- `tipoConta`: string (`'Médico Assinante'` | `'Medico / Demonstração'`)
- `pacientesCount`: number
- `atualizadoEm`: string (ISO 8601)

### 3. `patients` (Coleção de Pacientes e Prontuários Nefrológicos)
*Document ID: ID amigável ou UUID (ex: `paciente-joao-silva-a1b2`)*
- `id`: string
- `nome`: string
- `dataNascimento`: string (YYYY-MM-DD)
- `idade`: number
- `sexo`: string (`'M'` | `'F'`)
- `cpf`: string
- `telefone`: string
- `email`: string
- `endereco`: string
- `contatoEmergencia`: object `{ nome, telefone, parentesco }`
- `status`: string (`'Ativo'` | `'Em Tratamento'` | `'Transplantado'` | `'Óbito'`)
- `clinica`: string
- `hospital`: string
- `turno`: string (`'Manhã'` | `'Tarde'` | `'Noite'`)
- `diaSemana`: string (`'Seg/Qua/Sex'` | `'Ter/Qui/Sáb'`)
- `tipoAcesso`: string (`'FAV'` | `'Permcath'` | `'Cateter Duplo Lúmen'` | `'Prótese'`)
- `dataCriacaoAcesso`: string (YYYY-MM-DD)
- `posicaoAcesso`: string
- `etiologiaDRC`: string (ex: 'Nefropatia Diabética', 'HAS')
- `pesoSeco`: number (kg)
- `altura`: number (cm)
- `dataInicioDialise`: string (YYYY-MM-DD)
- `alergias`: array of strings
- `observacoesClinicas`: string
- `exames`: object com valores mais recentes de exames (Hb, Ht, Ferritina, IST, PTH, P, Ca, Vit D, FA, K, Na, HCO3, Kt/V, Ureia Pré/Pós, Creatinina, Albumina, PCR, Glicemia, HbA1c)
- `historicoExames`: array of objects contendo cada lançamento com data do exame e resultados
- `medicamentos`: array of objects contendo catálogo de medicações, doses, frequência, data de início, data de término, tipo de ciclo e status de alerta
- `atualizadoEm`: string (ISO 8601)

---

## 🔄 3. Ciclo de Entrega e Sequência de Deploy (Pipeline Padrão)

A cada alteração, melhoria de funcionalidade, ajuste de layout ou correção de bug, a execução DEVE seguir estritamente a seguinte ordem:

```
[ 1. Desenvolvimento & Testes ]
               │
               ▼
[ 2. Versionamento Automático (SemVer Patch & CHANGELOG.md) ]
               │
               ▼
[ 3. Build de Produção (Vite Build) ]
               │
               ▼
[ 4. Deploy na Nuvem (Firebase Hosting) ]
               │
               ▼
[ 5. Sincronização no GitHub (Git Commit, Tag & Push) ]
```

### Detalhamento das Etapas:
1. **Desenvolvimento & Validação**: Aplicar a melhoria/correção e validar o funcionamento com o Firestore.
2. **Versionamento Automático**:
   - Incrementar automaticamente a versão no `package.json` e em `src/version.js` (SemVer).
   - Registrar no `CHANGELOG.md` a descrição clara do que foi modificado, corrigido ou adicionado.
3. **Build de Produção**:
   - Executar `npm run build` gerando a pasta `dist` otimizada com a versão injetada no rodapé.
4. **Deploy na Nuvem (Firebase Hosting)**:
   - Publicar a nova versão imediatamente para a URL de produção (`https://nexai-nefro.web.app`) via `npx firebase-tools deploy --only hosting`.
5. **Sincronização no GitHub**:
   - Realizar `git add .`, `git commit -m "release(vX.Y.Z): descrição"`, criar a tag `git tag vX.Y.Z` e enviar com `git push origin main --tags`.

---

## ⚡ Atalho de Execução
Para executar todo esse fluxo automaticamente com um único comando:
```bash
npm run release "Descrição das mudanças realizadas"
```
ou
```bash
npm run deploy "Descrição das mudanças realizadas"
```

