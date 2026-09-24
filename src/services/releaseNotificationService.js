import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";
import { APP_VERSION } from "../version.js";

const SETTINGS_COLLECTION = "settings";
const NOTIFICATION_DOC_ID = "release_notifications";

export const DEFAULT_NOTIFICATION_SETTINGS = {
  periodicidade: "manual", // 'manual' | 'release' | 'semanal' | 'mensal'
  destinatariosModo: "todos", // 'todos' | 'teste'
  emailTeste: "",
  ultimoEnvio: null,
  ultimaVersaoEnviada: null,
  historicoEnvios: [],
  atualizadoEm: new Date().toISOString()
};

/**
 * Escuta configurações de notificação de releases no Cloud Firestore
 */
export function subscribeNotificationSettings(callback) {
  if (!db) {
    if (callback) callback(DEFAULT_NOTIFICATION_SETTINGS);
    return () => {};
  }

  const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_NOTIFICATION_SETTINGS, ...snap.data() });
      } else {
        setDoc(docRef, DEFAULT_NOTIFICATION_SETTINGS, { merge: true }).catch(console.error);
        callback(DEFAULT_NOTIFICATION_SETTINGS);
      }
    },
    (err) => {
      console.warn("Erro ao ler configurações de notificação de release:", err);
      callback(DEFAULT_NOTIFICATION_SETTINGS);
    }
  );
}

/**
 * Salva as configurações de notificação (incluindo periodicidade) no Firestore
 */
export async function saveNotificationSettings(newSettings) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_DOC_ID);

  const payload = {
    ...newSettings,
    atualizadoEm: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });
  return payload;
}

/**
 * Gera o template de e-mail HTML elegante e conciso com a identidade do NexAi-NEFRO
 */
export function generateReleaseEmailHtml(versionData, doctorName = "Doutor(a)") {
  const version = versionData?.version || APP_VERSION;
  const date = versionData?.date || new Date().toLocaleDateString('pt-BR');
  const title = versionData?.title || "Atualização e Novas Funcionalidades";
  const highlights = versionData?.highlights || [
    "Melhorias contínuas de usabilidade e agilidade clínica",
    "Aprimoramentos de segurança e estabilidade dos dados em nuvem"
  ];

  const highlightsHtml = highlights.map(item => {
    const cleanText = item.replace(/^[✨🚀📌•\s]+/, '').trim();
    return `
      <li style="margin-bottom: 8px; color: #334155; font-size: 14px; line-height: 1.5;">
        <span style="color: #2563eb; font-weight: bold; margin-right: 6px;">●</span>${cleanText}
      </li>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Novidades NexAi-NEFRO v${version}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header com Logomarca NexAi-NEFRO -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 32px 24px; text-align: center;">
              <table align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb, #10b981); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 20px; box-shadow: 0 4px 12px rgba(37,99,235,0.4);">
                    N
                  </td>
                  <td style="padding-left: 14px; text-align: left;">
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Nex-Ai<span style="color: #38bdf8;">.NEFRO</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                      Gestão Nefrológica Especializada
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo da Mensagem Curta e Direta -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
                🚀 Versão ${version} Disponível
              </div>

              <h1 style="font-size: 19px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
                Olá, ${doctorName}!
              </h1>

              <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                Preparamos novas melhorias para tornar sua rotina clínica ainda mais prática e precisa. Confira o resumo do que há de novo:
              </p>

              <!-- Card de Destaques -->
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                <div style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 10px;">
                  ${title}
                </div>
                <ul style="margin: 0; padding-left: 12px; list-style: none;">
                  ${highlightsHtml}
                </ul>
              </div>

              <!-- Botão de Ação CTA -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 24px 0;">
                    <a href="https://nexai-nefro.web.app" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.3);">
                      Acessar Sistema
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; text-align: center;">
                Sua aplicação é atualizada em tempo real na nuvem sem necessidade de reconfiguração manual.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0;">
                Nex-Ai.NEFRO • Software de Gestão Médica em Terapia Renal Substitutiva
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Você recebe este e-mail conforme a periodicidade configurada em sua conta médica.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Registra o disparo de notificação de versão para os clientes ou e-mail de teste
 */
export async function dispatchReleaseNotification({
  versionData,
  targetDoctors = [],
  settings = DEFAULT_NOTIFICATION_SETTINGS,
  adminEmail = "admin@nefroapp.com",
  isTest = false
}) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_DOC_ID);

  const version = versionData?.version || APP_VERSION;
  const recipients = isTest 
    ? [settings.emailTeste || adminEmail]
    : targetDoctors.filter(d => d.id !== 'dr-marcelo').map(d => d.email).filter(Boolean);

  const novoEnvio = {
    id: `disp-${Date.now()}`,
    data: new Date().toISOString(),
    versao: version,
    periodicidade: settings.periodicidade || "manual",
    destinatariosCount: recipients.length,
    destinatarios: recipients,
    titulo: versionData?.title || `Atualização v${version}`,
    modo: isTest ? 'Teste' : 'Produção',
    status: 'Concluído'
  };

  const historico = Array.isArray(settings.historicoEnvios) ? [...settings.historicoEnvios] : [];
  historico.unshift(novoEnvio);

  const updatedSettings = {
    ...settings,
    ultimoEnvio: new Date().toISOString(),
    ultimaVersaoEnviada: version,
    historicoEnvios: historico.slice(0, 30),
    atualizadoEm: new Date().toISOString()
  };

  await setDoc(docRef, updatedSettings, { merge: true });

  await logAuditEvent({
    tipoAcao: 'RELEASE_EMAIL_DISPATCHED',
    descricao: `Disparo de e-mail de novidades da versão v${version} (${isTest ? 'Teste para ' + recipients.join(', ') : recipients.length + ' médicos destinatários'}) - Periodicidade: ${settings.periodicidade}`,
    adminEmail,
    detalhes: novoEnvio
  });

  return { success: true, count: recipients.length, details: novoEnvio };
}
