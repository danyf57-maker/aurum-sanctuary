/**
 * Insight Card Component
 * 
 * Displays a single weekly insight with expand/collapse functionality.
 */

'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { useAuth } from '@/providers/auth-provider';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface InsightCardProps {
    insight: {
        id: string;
        insightText: string;
        periodStart: Date;
        periodEnd: Date;
        createdAt: Date;
        status: 'ready' | 'viewed';
    };
    isPremium?: boolean;
    onShowPaywall?: () => void;
}

export function InsightCard({ insight, isPremium, onShowPaywall }: InsightCardProps) {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState(insight.status);

    const handleExpand = async () => {
        setIsExpanded(!isExpanded);

        // Mark as viewed on first expand
        if (!isExpanded && status === 'ready' && user) {
            try {
                const insightRef = doc(firestore, 'users', user.uid, 'insights', insight.id);
                await updateDoc(insightRef, {
                    status: 'viewed',
                });
                setStatus('viewed');
            } catch (error) {
                console.error('Error marking insight as viewed:', error);
            }
        }
    };

    const periodText = `${format(insight.periodStart, 'MMM d')} - ${format(insight.periodEnd, 'MMM d, yyyy')}`;

    // Teaser logic
    const teaserLength = 100;
    const insightText = insight?.insightText || '';
    const isTeaser = !isPremium && insightText.length > teaserLength;
    const displayText = isTeaser
        ? `${insightText.substring(0, teaserLength)}...`
        : insightText;

    return (
        <div className="bg-[#F5F5DC] border border-[#8B4513] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <button
                onClick={handleExpand}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-[#F5F5DC]/80 transition-colors"
            >
                <div className="flex items-center gap-4 flex-1">
                    <Sparkles
                        className={`w-6 h-6 ${status === 'ready' ? 'text-[#D4AF37]' : 'text-[#8B4513] opacity-50'}`}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg text-[#8B4513]">
                                Weekly Insight
                            </h3>
                            {status === 'ready' && (
                                <span className="px-2 py-0.5 bg-[#D4AF37] text-white text-xs rounded-full">
                                    New
                                </span>
                            )}
                            {isPremium && (
                                <span className="px-2 py-0.5 border border-[#D4AF37] text-[#D4AF37] text-xs rounded-full font-medium">
                                    Pro
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-[#8B4513] opacity-60 mt-1">
                            {periodText}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#8B4513]" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-[#8B4513]" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-6 pb-6 border-t border-[#8B4513]/20">
                    <div className="pt-6">
                        <p className="text-[#8B4513] leading-relaxed whitespace-pre-wrap font-serif">
                            {displayText}
                        </p>

                        {isTeaser && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowPaywall?.();
                                }}
                                className="mt-4 text-[#D4AF37] font-medium hover:underline flex items-center gap-1"
                            >
                                <Sparkles className="w-4 h-4" />
                                Unlock full insight
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
