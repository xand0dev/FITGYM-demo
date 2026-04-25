import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import PremiumTable from '../ui/PremiumTable';

const formatTime = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
};

export default function AttendanceTab({ data = [] }) {
    const columns = [
        { label: 'Час', className: 'w-[180px]' },
        { label: 'Клієнт', className: '' },
        { label: 'Статус', className: 'text-center' },
        { label: 'Деталі', className: '' },
    ];

    const renderRow = (item) => (
        <>
            <td className="p-4">
                <div className="flex items-center gap-2 text-[#888] text-sm font-semibold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {formatTime(item.timestamp)}
                </div>
            </td>

            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-[#aaa]">
                        {(item.member_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[#fff] font-bold text-sm">{item.member_name || '—'}</span>
                </div>
            </td>

            <td className="p-4 text-center">
                {item.is_access_granted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Дозволено
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Відмовлено
                    </span>
                )}
            </td>

            <td className="p-4">
                <span className="text-[#666] text-xs font-semibold">
                    {item.denial_reason || (item.is_access_granted ? 'Вхід дозволено' : '—')}
                </span>
            </td>
        </>
    );

    // Лічильники для шапки
    const total = data.length;
    const granted = data.filter(i => i.is_access_granted).length;
    const denied = total - granted;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-wider text-[#ffffff] flex items-center gap-2">
                    Журнал: <span className="text-primary">Відвідування</span>
                </h3>
                {/* Лічильники */}
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-black text-[#aaa] uppercase tracking-wider">
                        Всього: <span className="text-white">{total}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-black text-green-400 uppercase tracking-wider">
                        ✓ {granted}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-black text-red-400 uppercase tracking-wider">
                        ✗ {denied}
                    </div>
                </div>
            </div>

            <PremiumTable
                columns={columns}
                data={data}
                keyExtractor={(item) => item.id}
                renderRow={renderRow}
                emptyMessage="Записів відвідувань не знайдено."
            />
        </div>
    );
}
