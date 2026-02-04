'use client';

import React from 'react';
import LandingV2 from '@/components/landing/LandingV2';

/**
 * JESUS SANDBOX
 * Use this route (http://localhost:9002/sandbox) to test new UI components
 * without affecting the main production landing page.
 */
export default function SandboxPage() {
    return (
        <main className="min-h-screen bg-stone-50">
            <div className="bg-amber-100 p-2 text-center text-[10px] uppercase tracking-widest text-amber-800 font-bold border-b border-amber-200 sticky top-0 z-[100]">
                Mode Bac à Sable - Jesus 🙏 | Nouveau Masterpiece en test
            </div>
            
            <LandingV2 />
        </main>
    );
}
