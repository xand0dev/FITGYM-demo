import React from 'react';
import { cn } from '../../lib/utils';

export default function GlassCard({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-xl border border-white/5 bg-[#141414]/60 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
