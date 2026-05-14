import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import {
    Building2, User, Mail, Phone, Lock, MapPin, Globe,
    CheckCircle2, ArrowRight, Crown, Loader2
} from 'lucide-react';
import { BASE_URL } from '../utils/api';
const API_BASE_URL = `${BASE_URL}/api`;

const TIMEZONES = [
    { value: 'Europe/Kyiv', label: 'Київ (UTC+2)' },
    { value: 'Europe/Warsaw', label: 'Варшава (UTC+1)' },
    { value: 'Europe/Berlin', label: 'Берлін (UTC+1)' },
];

export default function GymRegister() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addToast } = useUI();

    const [form, setForm] = useState({
        gym_name: '',
        timezone: 'Europe/Kyiv',
        owner_full_name: '',
        owner_email: '',
        owner_phone: '',
        username: '',
        password: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        const e = {};
        if (form.gym_name.trim().length < 2) e.gym_name = 'Введіть назву залу';
        if (form.owner_full_name.trim().length < 3) e.owner_full_name = 'Повне ім\'я мінімум 3 символи';
        if (!/\S+@\S+\.\S+/.test(form.owner_email)) e.owner_email = 'Невалідний email';
        if (form.username.length < 3) e.username = 'Логін мінімум 3 символи';
        if (form.password.length < 6) e.password = 'Пароль мінімум 6 символів';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/gyms/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Помилка реєстрації');
            }
            addToast(`Зал "${data.gym_name}" створено!`, 'success');
            login(data.token, data.username);
            // невелика затримка щоб login state встиг оновитись
            setTimeout(() => navigate('/admin'), 500);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080808] text-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 mb-4">
                        <Crown className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Запуск нового залу</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">
                        Зареєструй <span className="text-primary">свій зал</span>
                    </h1>
                    <p className="text-[#aaa] mt-4 max-w-md mx-auto">
                        Запусти свій фітнес-клуб на платформі FITGYM за 2 хвилини.
                        Дефолтні тарифи, multi-tenancy ізоляція, готова адмінка.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="bg-[#141414] border border-[#222] rounded-2xl p-8 shadow-[0_20px_60px_rgba(255,0,0,0.08)]">

                    {/* Gym info */}
                    <section className="mb-8">
                        <h2 className="text-sm font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Про зал
                        </h2>
                        <Field label="Назва залу" error={errors.gym_name} icon={Building2}>
                            <input
                                value={form.gym_name} onChange={update('gym_name')}
                                placeholder="напр. Pulse Fitness"
                                className="input-field"
                            />
                        </Field>
                        <Field label="Часовий пояс" icon={Globe}>
                            <select
                                value={form.timezone} onChange={update('timezone')}
                                className="input-field appearance-none cursor-pointer"
                            >
                                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                            </select>
                        </Field>
                    </section>

                    {/* Owner info */}
                    <section className="mb-8">
                        <h2 className="text-sm font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Власник
                        </h2>
                        <Field label="Повне ім'я" error={errors.owner_full_name} icon={User}>
                            <input
                                value={form.owner_full_name} onChange={update('owner_full_name')}
                                placeholder="Іван Петренко"
                                className="input-field"
                            />
                        </Field>
                        <Field label="Email" error={errors.owner_email} icon={Mail}>
                            <input
                                type="email" value={form.owner_email} onChange={update('owner_email')}
                                placeholder="ivan@pulse.ua"
                                className="input-field"
                            />
                        </Field>
                        <Field label="Телефон" icon={Phone}>
                            <input
                                value={form.owner_phone} onChange={update('owner_phone')}
                                placeholder="+380..."
                                className="input-field"
                            />
                        </Field>
                    </section>

                    {/* Credentials */}
                    <section className="mb-8">
                        <h2 className="text-sm font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Доступ до адмінки
                        </h2>
                        <Field label="Логін" error={errors.username} icon={User}>
                            <input
                                value={form.username} onChange={update('username')}
                                placeholder="ivan_admin"
                                className="input-field"
                                autoComplete="username"
                            />
                        </Field>
                        <Field label="Пароль" error={errors.password} icon={Lock}>
                            <input
                                type="password" value={form.password} onChange={update('password')}
                                placeholder="мінімум 6 символів"
                                className="input-field"
                                autoComplete="new-password"
                            />
                        </Field>
                    </section>

                    {/* What you get */}
                    <section className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3">Що ти одразу отримаєш</h3>
                        <ul className="space-y-2 text-sm text-[#ccc]">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span>3 базові тарифи (Місячний, Піврічний, Річний)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span>Повна адмін-панель з multi-tenancy ізоляцією</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span>Аналітичний дашборд + QR-чек-ін з аудит-журналом</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span>Інтеграція з LiqPay (sandbox) для онлайн-оплат</span>
                            </li>
                        </ul>
                    </section>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,0,0,0.3)]"
                    >
                        {submitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Створюємо ваш зал...</>
                        ) : (
                            <>Запустити FITGYM <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-[#666] mt-6 uppercase tracking-wider font-bold">
                        Натискаючи кнопку, ти приймаєш умови сервісу FITGYM
                    </p>
                </form>
            </div>

            <style>{`
                .input-field {
                    width: 100%;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    color: white;
                    padding: 14px 16px;
                    border-radius: 12px;
                    font-size: 15px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: #cc0000;
                    box-shadow: 0 0 0 3px rgba(204,0,0,0.15);
                }
                .input-field::placeholder { color: #555; }
            `}</style>
        </div>
    );
}

const Field = ({ label, error, icon: Icon, children }) => (
    <div className="mb-4">
        <label className="block text-xs font-black uppercase tracking-wider text-[#aaa] mb-2">
            {label}
        </label>
        {children}
        {error && <p className="text-red-400 text-xs mt-1 font-bold">{error}</p>}
    </div>
);
