import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Serviço 100% Cloud para upload de arquivos no Firebase Storage
 */

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param {string} path Caminho de destino (ex: 'pacientes/exames/laudo.pdf' ou 'medicos/fotos/dr-marcelo.jpg')
 * @param {File|Blob} file Objeto File ou Blob do navegador
 * @returns {Promise<string>} URL de download pública do arquivo
 */
export async function uploadFileToStorage(path, file) {
  if (!storage) throw new Error("Firebase Storage não está inicializado.");
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Remove um arquivo do Firebase Storage
 * @param {string} path Caminho do arquivo ou URL de download
 */
export async function deleteFileFromStorage(path) {
  if (!storage) throw new Error("Firebase Storage não está inicializado.");
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
