import React from 'react';
import { Settings, User, Bell, Shield } from "lucide-react";

export default function CabinetSettings({ user }) {
    const firstName = user?.first_name || user?.username || 'Невідомий';
    const lastName = user?.last_name || '';
    const email = user?.email || 'Немає email';

    return (
        <div className="space-y-6 animate-fade-in text-[var(--c-text)]">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    <span className="text-primary">Налаштування</span>
                </h2>
                <p className="text-[#888] text-sm mt-1 font-bold">
                    Керуйте вашим обліковим записом
                </p>
            </div>

            <div className="space-y-4">
                {/* Profile */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-primary" /> Профіль
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Ім'я", value: firstName },
                            { label: "Прізвище", value: lastName },
                            { label: "Email", value: email },
                            { label: "Телефон", value: "+380 99 123 4567" },
                        ].map((f) => (
                            <div key={f.label}>
                                <label className="text-xs text-primary font-black uppercase tracking-wider block mb-1.5">{f.label}</label>
                                <div className="w-full px-4 py-2.5 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)] text-sm font-bold opacity-80">
                                    {f.value || '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-primary" /> Сповіщення
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: "Email-сповіщення", description: "Отримувати оновлення на пошту", enabled: true },
                            { label: "Push-сповіщення", description: "Браузерні сповіщення", enabled: false },
                            { label: "Нагадування про заняття", description: "За 1 годину до заняття", enabled: true },
                        ].map((n) => (
                            <div key={n.label} className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                                <div>
                                    <p className="text-sm font-bold">{n.label}</p>
                                    <p className="text-xs text-[#888] font-semibold">{n.description}</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${n.enabled ? "bg-primary" : "bg-[var(--c-border)]"}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${isLightMode ? 'bg-white' : 'bg-white'} ${n.enabled ? "right-0.5" : "left-0.5"}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary" /> Безпека
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                            <div>
                                <p className="text-sm font-bold">Змінити пароль</p>
                                <p className="text-xs text-[#888] font-semibold">Остання зміна: 15.10.2024</p>
                            </div>
                            <button className="text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
                                Змінити
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-input)] border border-[var(--c-border)]">
                            <div>
                                <p className="text-sm font-bold">Двофакторна автентифікація</p>
                                <p className="text-xs text-[#888] font-semibold">Додатковий захист акаунту</p>
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-[#888]">Вимкнено</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Quick check to fix class name logic in dummy toggles
const isLightMode = false; // We use CSS variables so actual color handles this
