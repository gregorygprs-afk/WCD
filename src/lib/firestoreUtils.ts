import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const logAudit = async (entityType: string, entityId: string, action: 'create' | 'update' | 'delete', changes: any) => {
  if (!auth.currentUser) return;
  
  try {
    const logRef = collection(db, 'auditLogs');
    await addDoc(logRef, {
      entityType,
      entityId,
      action,
      changes: JSON.stringify(changes),
      timestamp: new Date().toISOString(),
      userId: auth.currentUser.uid
    });
  } catch (error) {
    console.error("Failed to log audit", error);
  }
};

export const createDocument = async (collectionName: string, data: any, customId?: string) => {
  try {
    let docRef;
    if (customId) {
      docRef = doc(db, collectionName, customId);
      await setDoc(docRef, data);
    } else {
      const collRef = collection(db, collectionName);
      docRef = await addDoc(collRef, data);
    }
    await logAudit(collectionName, docRef.id, 'create', data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    await logAudit(collectionName, docId, 'update', data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    await logAudit(collectionName, docId, 'delete', { deleted: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
};
