import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";
import { APP_VERSION } from "../version.js";
import { humanizeChangeText, categorizeChange } from "../utils/versionUtils.js";
import { SYSTEM_CHANGELOG } from "../data/versions.js";

const SETTINGS_COLLECTION = "settings";
const NOTIFICATION_DOC_ID = "release_notifications";

export const DEFAULT_NOTIFICATION_SETTINGS = {
  periodicidade: "release", // 'release' | 'manual' | 'semanal' | 'mensal'
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
 * Gera o template de e-mail HTML elegante, conciso e 100% humanizado
 * Remove quaisquer jargões técnicos (feat, fix, etc.) e inclui badges visuais.
 */
export function generateReleaseEmailHtml(versionData, doctorName = "Doutor(a)") {
  const version = versionData?.version || APP_VERSION;
  const rawTitle = versionData?.title || "Atualização e Novas Funcionalidades";
  const title = humanizeChangeText(rawTitle) || "Atualização e Novas Funcionalidades";

  const rawHighlights = versionData?.highlights || [
    "Melhorias contínuas de usabilidade e agilidade clínica",
    "Aprimoramentos de segurança e estabilidade dos dados em nuvem"
  ];

  const highlightsHtml = rawHighlights.map(item => {
    const rawText = typeof item === 'object' ? item.text || item.original : item;
    const cleanText = humanizeChangeText(rawText);
    const cat = categorizeChange(rawText);

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; vertical-align: top; width: 85px;">
          <span style="display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background-color: ${cat.badgeBg}; border: 1px solid ${cat.badgeBorder}; color: ${cat.badgeColor};">
            ${cat.label}
          </span>
        </td>
        <td style="padding: 10px 0 10px 10px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
          ${cleanText}
        </td>
      </tr>
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
                Preparamos novas atualizações para aprimorar sua rotina clínica e a gestão de pacientes. Confira os destaques desta versão:
              </p>

              <!-- Card de Destaques -->
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                <div style="font-weight: 700; font-size: 15px; color: #1e293b; margin-bottom: 12px;">
                  ${title}
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                  ${highlightsHtml}
                </table>
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
                Você recebe este e-mail como médico cadastrado na plataforma NexAi-NEFRO.
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
 * Registra o disparo de notificação de versão para os clientes ou e-mail de teste.
 * Enfileira as mensagens na coleção `mail` do Cloud Firestore para disparo real de e-mails.
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
  const rawTitle = versionData?.title || `Atualização v${version}`;
  const cleanTitle = humanizeChangeText(rawTitle);

  // Destinatários: Todos os médicos cadastrados com e-mail válido (não bloqueia Dr. Marcelo ou outros médicos)
  let recipientList = [];
  if (isTest) {
    const testEmail = (settings.emailTeste || adminEmail).trim();
    if (testEmail) {
      recipientList.push({
        email: testEmail,
        nome: "Administrador (Teste)"
      });
    }
  } else {
    // Produção: Todos os médicos com e-mail cadastrado e licença não cancelada
    const emailSet = new Set();
    targetDoctors.forEach(doc => {
      const email = (doc.email || "").trim().toLowerCase();
      if (email && email.includes("@") && doc.statusLicenca !== 'Cancelado' && !emailSet.has(email)) {
        emailSet.add(email);
        recipientList.push({
          id: doc.id,
          email,
          nome: doc.nome || "Doutor(a)"
        });
      }
    });
  }

  // 1. Enfileirar cada e-mail na coleção 'mail' do Cloud Firestore (Trigger Email)
  const mailCollection = collection(db, "mail");
  let emailsQueued = 0;

  for (const recipient of recipientList) {
    try {
      const htmlContent = generateReleaseEmailHtml(versionData, recipient.nome);
      await addDoc(mailCollection, {
        to: [recipient.email],
        message: {
          subject: `NexAi-NEFRO v${version} • ${cleanTitle}`,
          html: htmlContent,
          text: `A versão v${version} do NexAi-NEFRO já está disponível na nuvem com novas melhorias e recursos.`
        },
        metadata: {
          versao: version,
          doctorId: recipient.id || null,
          destinatarioNome: recipient.nome,
          tipo: 'release_notification',
          isTest: Boolean(isTest),
          enviadoEm: new Date().toISOString()
        }
      });
      emailsQueued++;
    } catch (mailErr) {
      console.warn(`Erro ao enfileirar e-mail na coleção 'mail' para ${recipient.email}:`, mailErr);
    }
  }

  // 2. Registrar no documento de configurações do Firestore
  const novoEnvio = {
    id: `disp-${Date.now()}`,
    data: new Date().toISOString(),
    versao: version,
    periodicidade: settings.periodicidade || "release",
    destinatariosCount: recipientList.length,
    destinatarios: recipientList.map(r => r.email),
    emailsQueued,
    titulo: cleanTitle,
    modo: isTest ? 'Teste' : 'Produção',
    status: 'Concluído'
  };

  const historico = Array.isArray(settings.historicoEnvios) ? [...settings.historicoEnvios] : [];
  historico.unshift(novoEnvio);

  const updatedSettings = {
    ...settings,
    ultimoEnvio: new Date().toISOString(),
    ultimaVersaoEnviada: version,
    historicoEnvios: historico.slice(0, 50),
    atualizadoEm: new Date().toISOString()
  };

  await setDoc(docRef, updatedSettings, { merge: true });

  // 3. Registrar auditoria de segurança
  await logAuditEvent({
    tipoAcao: 'RELEASE_EMAIL_DISPATCHED',
    descricao: `Disparo de e-mail de novidades da versão v${version} (${isTest ? 'Teste para ' + recipientList.map(r => r.email).join(', ') : recipientList.length + ' médicos cadastrados'})`,
    adminEmail,
    detalhes: novoEnvio
  });

  return { 
    success: true, 
    count: recipientList.length, 
    emailsQueued,
    details: novoEnvio 
  };
}

/**
 * Verifica e executa o disparo automático para nova versão.
 * Garante idempotência: só dispara se a versão atual do app (APP_VERSION)
 * for diferente da última versão registrada no Firestore (ultimaVersaoEnviada).
 */
export async function checkAndAutoDispatchNewRelease({ adminEmail = "sistema@nexai-nefro.com" } = {}) {
  if (!db) return { triggered: false, reason: "Sem conexão com Firestore" };

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, NOTIFICATION_DOC_ID);
    const snap = await getDoc(docRef);
    const currentSettings = snap.exists() ? snap.data() : DEFAULT_NOTIFICATION_SETTINGS;

    const periodicidade = currentSettings.periodicidade || "release";
    const ultimaEnviada = currentSettings.ultimaVersaoEnviada;

    // Se não estiver configurado para 'release' (instantâneo a cada versão) ou se já foi enviada
    if (periodicidade !== "release") {
      return { triggered: false, reason: `Periodicidade é '${periodicidade}' (não é automática por release)` };
    }

    if (ultimaEnviada === APP_VERSION) {
      return { triggered: false, reason: `A versão v${APP_VERSION} já teve seu disparo executado anteriormente.` };
    }

    // Busca médicos cadastrados no Firestore
    const doctorsSnap = await getDocs(collection(db, "doctors"));
    const doctors = [];
    doctorsSnap.forEach(d => {
      doctors.push({ id: d.id, ...d.data() });
    });

    // Encontra os dados da versão atual
    const versionItem = SYSTEM_CHANGELOG.find(v => v.version === APP_VERSION) || SYSTEM_CHANGELOG[0];

    console.log(`🚀 [Automação] Detectada nova versão v${APP_VERSION} não notificada! Disparando e-mails para ${doctors.length} médicos cadastrados...`);

    const result = await dispatchReleaseNotification({
      versionData: versionItem,
      targetDoctors: doctors,
      settings: currentSettings,
      adminEmail,
      isTest: false
    });

    return { 
      triggered: true, 
      version: APP_VERSION, 
      count: result.count, 
      emailsQueued: result.emailsQueued 
    };
  } catch (err) {
    console.error("❌ Falha na auto-verificação de disparo de nova versão:", err);
    return { triggered: false, error: err.message };
  }
}
