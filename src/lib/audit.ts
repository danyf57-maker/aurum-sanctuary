
"use server";

import { db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export type AuditAction = 
    | 'USER_LOGIN_GOOGLE'
    | 'USER_LOGIN_EMAIL'
    | 'USER_LOGOUT'
    | 'MESSAGE_SENT'
    | 'DATA_EXPORTED'
    | 'ACCOUNT_DELETED'
    | 'RATE_LIMIT_EXCEEDED';

interface AuditEvent {
    userId: string;
    action: AuditAction;
    timestamp: Timestamp;
    metadata?: Record<string, any>;
}

export async function logAuditEvent(userId: string, action: AuditAction, metadata?: Record<string, any>) {
    if (!userId) {
        console.error("Tentative de log d'audit sans userId.");
        return;
    }

    const log: AuditEvent = {
        userId,
        action,
        timestamp: Timestamp.now(),
    };

    if (metadata) {
        log.metadata = metadata;
    }

    try {
        await db.collection('auditLogs').add(log);
    } catch (error) {
        console.error(`Erreur lors de l'écriture du log d'audit pour ${userId}:`, error);
    }
}
