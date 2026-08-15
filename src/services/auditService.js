import { collection, doc, setDoc, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.js";

const AUDIT_COLLECTION = "audit_logs";

/**
 * Registra um evento imutável na trilha de auditoria e conformidade no Cloud Firestore
 * @param {Object} eventData
 * @param {string} eventData.tipoAcao - 'IMPERSONATION' | 'LICENSE_CREATED' | 'LICENSE_UPDATE' | 'LICENSE_PAUSED' | 'LICENSE_REACTIVATED' | 'LICENSE_RENEWED' | 'DEMO_RESET'
 * @param {string} eventData.descricao - Descrição amigável do evento
 * @param {string} [eventData.targetDoctorId] - ID do médico envolvido (se aplicável)
 * @param {string} [eventData.targetDoctorName] - Nome do médico envolvido (se aplicável)
 * @param {string} [eventData.adminEmail] - E-mail do administrador responsável
 * @param {Object} [eventData.detalhes] - Dados adicionais ou contexto
 */
export async function logAuditEvent({
  tipoAcao,
  descricao,
  targetDoctorId = null,
  targetDoctorName = null,
  adminEmail = "admin@nefroapp.com",
  detalhes = {}
}) {
  if (!db) {
    console.warn("Firestore não conectado para registrar auditoria.");
    return null;
  }

  try {
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logDocRef = doc(db, AUDIT_COLLECTION, logId);

    const logRecord = {
      id: logId,
      timestamp: new Date().toISOString(),
      tipoAcao,
      descricao,
      adminEmail,
      targetDoctorId,
      targetDoctorName,
      detalhes,
      ipOrigem: "Cloud Web Client"
    };

    await setDoc(logDocRef, logRecord);
    return logRecord;
  } catch (err) {
    console.error("Falha ao registrar log de auditoria no Firestore:", err);
    return null;
  }
}

/**
 * Escuta em tempo real a trilha de auditoria do sistema
 * @param {Function} callback - Recebe o array de logs ordenados do mais recente para o mais antigo
 * @param {number} maxRecords - Quantidade máxima de registros recentes
 */
export function subscribeAuditLogs(callback, maxRecords = 40) {
  if (!db) {
    if (callback) callback([]);
    return () => {};
  }

  try {
    const colRef = collection(db, AUDIT_COLLECTION);
    const q = query(colRef, orderBy("timestamp", "desc"), limit(maxRecords));

    return onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        if (callback) callback(logs);
      },
      (err) => {
        console.warn("Erro ao escutar audit_logs no Firestore:", err);
        // Fallback sem ordenação caso índice composto ainda esteja criando
        const simpleUnsub = onSnapshot(colRef, (simpleSnap) => {
          const simpleLogs = simpleSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          simpleLogs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
          if (callback) callback(simpleLogs.slice(0, maxRecords));
        });
        return simpleUnsub;
      }
    );
  } catch (err) {
    console.error("Falha ao configurar snapshot de auditoria:", err);
    if (callback) callback([]);
    return () => {};
  }
}
