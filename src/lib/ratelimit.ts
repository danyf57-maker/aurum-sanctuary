
"use server";

import { db } from "@/lib/firebase/server-config";
import { Timestamp } from "firebase-admin/firestore";
import { logger } from "@/lib/logger/safe";

type RateLimitAction = 'submitAurumMessage' | 'exportUserData' | 'deleteUserAccount';

interface RateLimitConfig {
    limit: number;
    duration: number; // in seconds
}

const actionConfigs: Record<RateLimitAction, RateLimitConfig> = {
    submitAurumMessage: { limit: 10, duration: 60 * 60 }, // 10 messages par heure
    exportUserData: { limit: 3, duration: 24 * 60 * 60 }, // 3 exports par jour
    deleteUserAccount: { limit: 1, duration: 24 * 60 * 60 }, // 1 tentative par jour
};

interface RateLimitStatus {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}

export async function checkRateLimit(userId: string, action: RateLimitAction): Promise<RateLimitStatus> {
    const config = actionConfigs[action];
    if (!config) {
        throw new Error(`Configuration de rate limit non trouvée pour l'action: ${action}`);
    }

    const now = Timestamp.now();
    const userRateLimitRef = db.collection('rateLimits').doc(userId);

    try {
        const doc = await userRateLimitRef.get();
        const data = doc.data() || {};

        const actionData = data[action] || { count: 0, resetAt: now };
        const resetAt = (actionData.resetAt as Timestamp);

        if (now >= resetAt) {
            // Période expirée, on réinitialise
            const newResetAt = Timestamp.fromMillis(now.toMillis() + config.duration * 1000);
            await userRateLimitRef.set({
                [action]: {
                    count: 1,
                    resetAt: newResetAt
                }
            }, { merge: true });

            return {
                allowed: true,
                remaining: config.limit - 1,
                resetAt: newResetAt.toDate()
            };
        }

        if (actionData.count >= config.limit) {
            // Limite atteinte
            return {
                allowed: false,
                remaining: 0,
                resetAt: resetAt.toDate()
            };
        }

        // Incrémenter le compteur
        await userRateLimitRef.set({
            [action]: {
                count: actionData.count + 1
            }
        }, { merge: true });

        return {
            allowed: true,
            remaining: config.limit - (actionData.count + 1),
            resetAt: resetAt.toDate()
        };

    } catch (error) {
        logger.errorSafe('Erreur lors de la vérification du rate limit', error, {
            action: action
        });
        // En cas d'erreur, on refuse par sécurité
        return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(Date.now() + config.duration * 1000)
        };
    }
}
