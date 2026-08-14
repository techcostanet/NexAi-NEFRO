# Regras Mandatórias do Projeto NexAi-NEFRO

1. **Arquitetura Nuvem**: Nunca armazenar dados em arquivos locais. Sempre usar Firebase Auth e Cloud Firestore.
2. **Versionamento e Changelog**: Toda alteração concluída deve incrementar a versão SemVer e registrar as mudanças no CHANGELOG.md.
3. **Deploy Contínuo**: Realizar build e deploy imediato no Firebase Hosting a cada melhoria/correção finalizada.
4. **Sincronização no GitHub**: Criar commit padronizado com a tag da versão e enviar para o GitHub (`origin main --tags`).
