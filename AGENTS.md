# Regras e Diretrizes do Projeto NexAi-NEFRO

Este documento define o fluxo de trabalho obrigatório e os padrões arquiteturais para o desenvolvimento contínuo do **NexAi-NEFRO**.

---

## 🏛️ 1. Arquitetura 100% Cloud (Firebase & Cloud Firestore)
- **Zero armazenamento estático/local**: Nenhum dado de produção, lista de pacientes, exames, logins ou históricos deve ficar armazenado em arquivos locais (ex: JSONs locais ou localStorage sem sincronização).
- **Fonte única da verdade**: Toda leitura e escrita deve ocorrer diretamente nas coleções do **Firebase Firestore** e **Firebase Auth**.
- **Sincronização em Tempo Real**: Sempre priorizar listeners do Firestore (`onSnapshot`) para que atualizações feitas por médicos ou administradores sejam refletidas instantaneamente.

---

## 🔄 2. Ciclo de Entrega e Sequência de Deploy (Pipeline Padrão)

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
