import React from 'react';
import { cn } from '../../lib/utils';
import GlassCard from './GlassCard';

export default function PremiumTable({ columns, data, keyExtractor, renderRow, emptyMessage }) {
    return (
        <GlassCard className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                <thead>
                    <tr className="border-b border-[#222] bg-[#0a0a0a]">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={cn(
                                    "p-4 text-xs font-black text-[#aaaaaa] uppercase tracking-wider",
                                    col.className
                                )}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <tr
                                key={keyExtractor(item, index)}
                                className="border-b border-[#222] transition-colors duration-200 hover:bg-white/5 last:border-none"
                            >
                                {renderRow(item)}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center text-[#aaaaaa] p-10 font-bold">
                                {emptyMessage || 'Дані відсутні.'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </GlassCard>
    );
}
