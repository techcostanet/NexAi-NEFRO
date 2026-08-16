import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";

const PLANS_COLLECTION = "system_plans";
const SETTINGS_COLLECTION = "settings";
const GATEWAY_DOC_ID = "gateways";

export const DEFAULT_PLANS = [
  {
    id: "plano-mensal",
    nome: "Plano Mensal Nefrologia",
    descricao: "Acesso completo e ilimitado a prontuários, diálise e prescrições",
    valor: 490.00,
    intervalo: "mensal",
    destaque: true,
    status: "Ativo",
    recursos: ["Prontuários Ilimitados", "Parâmetros Dialíticos", "Prescrições com Alertas", "Suporte Prioritário"],
    ordem: 1,
    criadoEm: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "plano-anual",
    nome: "Plano Anual com Desconto",
    descricao: "Cobrança anual única equivalente a 10 meses (+2 meses de bônus)",
    valor: 4900.00,
    intervalo: "anual",
    destaque: false,
    status: "Ativo",
    recursos: ["Todos os recursos do plano mensal", "2 meses grátis de economia", "Treinamento de equipe", "Backup dedicado"],
    ordem: 2,
    criadoEm: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "plano-trial",
    nome: "Plano Trial / Demonstração",
    descricao: "Avaliação completa para novos nefrologistas e clínicas",
    valor: 0.00,
    intervalo: "trial",
    destaque: false,
    status: "Ativo",
    recursos: ["Acesso por 15 a 30 dias", "6 pacientes demonstrativos", "Sem necessidade de cartão"],
    ordem: 3,
    criadoEm: "2026-08-01T00:00:00.000Z"
  }
];

export const DEFAULT_GATEWAY_CONFIG = {
  pix: {
    ativo: true,
    tipoChave: "CNPJ",
    chavePix: "12.345.678/0001-90",
    titular: "NexAi Soluções em Saúde LTDA",
    banco: "Banco do Brasil / Cora"
  },
  cartao: {
    provedor: "Asaas",
    ativo: true,
    ambiente: "sandbox", // 'sandbox' | 'producao'
    apiKey: "ak_test_nexai_prod_secret_token_123",
    webhookUrl: "https://nexai-nefro.web.app/api/webhooks/asaas"
  },
  regrasCobranca: {
    diasTolerancia: 5,
    suspensaoAutomatica: true,
    notificarWhatsApp: true,
    notificarEmail: true
  },
  atualizadoEm: new Date().toISOString()
};

/**
 * Escuta os planos do sistema no Cloud Firestore em tempo real
 */
export function subscribeSystemPlans(callback) {
  if (!db) {
    if (callback) callback(DEFAULT_PLANS);
    return () => {};
  }

  const plansCol = collection(db, PLANS_COLLECTION);
  return onSnapshot(
    plansCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Inicializa com os planos padrão no Firestore
        for (const plan of DEFAULT_PLANS) {
          try {
            await setDoc(doc(db, PLANS_COLLECTION, plan.id), plan);
          } catch (e) {
            console.error("Erro ao inicializar plano no Firestore:", e);
          }
        }
        if (callback) callback(DEFAULT_PLANS);
      } else {
        const list = snapshot.docs.map(snap => ({ id: snap.id, ...snap.data() }));
        list.sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
        if (callback) callback(list);
      }
    },
    (err) => {
      console.warn("Erro ao buscar planos do Firestore:", err);
      if (callback) callback(DEFAULT_PLANS);
    }
  );
}

/**
 * Cria ou edita um plano de assinatura no Firestore
 */
export async function saveSystemPlan(planData, planId = null, adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  
  const targetId = planId || planData.id || `plano-${Date.now()}`;
  const docRef = doc(db, PLANS_COLLECTION, targetId);
  const snap = await getDoc(docRef);
  const isCreate = !snap.exists();

  const payload = {
    ...planData,
    id: targetId,
    valor: Number(planData.valor) || 0,
    status: planData.status || "Ativo",
    atualizadoEm: new Date().toISOString()
  };

  if (isCreate) {
    payload.criadoEm = new Date().toISOString();
  }

  await setDoc(docRef, payload, { merge: true });

  await logAuditEvent({
    tipoAcao: isCreate ? 'PLAN_CREATED' : 'PLAN_UPDATED',
    descricao: isCreate 
      ? `Novo plano '${payload.nome}' criado com valor R$ ${payload.valor.toFixed(2)} (${payload.intervalo})`
      : `Plano '${payload.nome}' atualizado para valor R$ ${payload.valor.toFixed(2)}`,
    adminEmail,
    detalhes: { planId: targetId, payload }
  });

  return payload;
}

/**
 * Exclui um plano do Firestore
 */
export async function deleteSystemPlan(planId, planNome = "Plano", adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const docRef = doc(db, PLANS_COLLECTION, planId);
  await deleteDoc(docRef);

  await logAuditEvent({
    tipoAcao: 'PLAN_DELETED',
    descricao: `Plano '${planNome}' (${planId}) foi removido do catálogo pelo administrador`,
    adminEmail,
    detalhes: { planId, planNome }
  });
}

/**
 * Alterna status de ativação de um plano (Ativo / Inativo)
 */
export async function toggleSystemPlanStatus(planId, currentStatus, planNome = "Plano", adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const nextStatus = currentStatus === "Ativo" ? "Inativo" : "Ativo";
  const docRef = doc(db, PLANS_COLLECTION, planId);
  
  await updateDoc(docRef, {
    status: nextStatus,
    atualizadoEm: new Date().toISOString()
  });

  await logAuditEvent({
    tipoAcao: 'PLAN_STATUS_CHANGED',
    descricao: `Status do plano '${planNome}' alterado para '${nextStatus}'`,
    adminEmail,
    detalhes: { planId, oldStatus: currentStatus, newStatus: nextStatus }
  });

  return nextStatus;
}

/**
 * Escuta configurações de gateways e faturamento em tempo real
 */
export function subscribeGatewayConfig(callback) {
  if (!db) {
    if (callback) callback(DEFAULT_GATEWAY_CONFIG);
    return () => {};
  }

  const docRef = doc(db, SETTINGS_COLLECTION, GATEWAY_DOC_ID);
  return onSnapshot(
    docRef,
    async (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        try {
          await setDoc(docRef, DEFAULT_GATEWAY_CONFIG);
        } catch (e) {
          console.error("Erro ao salvar config inicial de gateways:", e);
        }
        if (callback) callback(DEFAULT_GATEWAY_CONFIG);
      }
    },
    (err) => {
      console.warn("Erro ao buscar configurações de gateway:", err);
      if (callback) callback(DEFAULT_GATEWAY_CONFIG);
    }
  );
}

/**
 * Salva as configurações de gateways no Cloud Firestore
 */
export async function saveGatewayConfig(configData, adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const docRef = doc(db, SETTINGS_COLLECTION, GATEWAY_DOC_ID);
  
  const payload = {
    ...configData,
    atualizadoEm: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });

  await logAuditEvent({
    tipoAcao: 'GATEWAY_CONFIG_UPDATED',
    descricao: `Configurações de Gateways e Cobrança atualizadas pelo administrador (Provedor: ${configData.cartao?.provedor || 'Asaas'}, Ambiente: ${configData.cartao?.ambiente || 'sandbox'})`,
    adminEmail,
    detalhes: { config: payload }
  });

  return payload;
}
