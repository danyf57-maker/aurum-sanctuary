/**
 * Notifications Hook
 * 
 * Manages user notifications (in-app only for V1).
 */

'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';

export interface Notification {
    id: string;
    type: 'insight_ready' | 'other';
    message: string;
    createdAt: Date;
    read: boolean;
    insightId?: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        // Real-time listener for notifications
        const notificationsRef = collection(firestore, 'users', user.uid, 'notifications');
        const q = query(
            notificationsRef,
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications: Notification[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data.type || 'other',
                    message: data.message || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    read: data.read || false,
                    insightId: data.insightId,
                };
            });

            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    /**
     * Mark notification as read
     */
    const markAsRead = async (notificationId: string) => {
        if (!user) return;

        try {
            const notificationRef = doc(firestore, 'users', user.uid, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true,
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = async () => {
        if (!user) return;

        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            await Promise.all(
                unreadNotifications.map(n => markAsRead(n.id))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    };
}
