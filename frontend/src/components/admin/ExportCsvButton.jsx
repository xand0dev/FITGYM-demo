import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { BASE_URL, getToken } from '../../utils/api';
import { useUI } from '../../context/UIContext';

/**
 * Кнопка завантаження CSV з адмін-ендпоінту.
 * Робить fetch з токеном, конвертує у Blob і тригерить браузерний download.
 *
 * @param {string} endpoint - відносний шлях (напр. '/api/admin/export/members.csv')
 * @param {string} filename - назва файлу для збереження
 * @param {string} [label='CSV']
 */
export default function ExportCsvButton({ endpoint, filename, label = 'CSV' }) {
    const [busy, setBusy] = useState(false);
    const { addToast } = useUI();

    const onClick = async () => {
        setBusy(true);
        try {
            const token = getToken();
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                headers: token ? { Authorization: `Token ${token}` } : {},
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast(`Завантажено ${filename}`, 'success');
        } catch (e) {
            addToast(`Помилка експорту: ${e.message}`, 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={busy}
            title="Експорт у CSV (Excel-сумісно)"
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-[#333] text-[#aaa] hover:text-white hover:border-primary/40 hover:bg-primary/10 font-black text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{label}</span>
        </button>
    );
}
