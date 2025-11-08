/* ===========================
   content.js — Логіка (Тренери, Абонементи)
   =========================== */

import { fetchPublicData } from './api.js';
import { showToast, escapeHtml } from './ui.js';
import { getToken } from './auth.js';

/* 1. API: ТРЕНЕРИ */
export async function populateTrainers() {
    const grid = document.getElementById('trainersGrid');
    if (!grid) return;

    let trainers = [];
    try {
        trainers = await fetchPublicData('/api/instructors/');
        if (!Array.isArray(trainers)) throw new Error('Невірний формат даних API');

    } catch (error) {
        console.error("API Error (Trainers):", error);
        showToast('Помилка API: Тренери. Використовуються демо-дані.', 'error');
        // Заглушка (mock data)
        trainers = [
            { full_name: 'Іван Петров', specialties: 'Кросфіт / Функціональний тренінг', photo_url: 'img/муж2.jpg' },
            { full_name: 'Олена Коваль', specialties: 'Фітнес / Йога / Стретчинг', photo_url: 'img/жін2.jpg' },
            { full_name: 'Андрій Сидоренко', specialties: 'Бодібілдинг / Персональні тренування', photo_url: 'img/муж1.png' },
        ];
    }

    grid.innerHTML = trainers.map((p, i) => `
        <div class="trainer-card" data-aos="flip-up" data-aos-delay="${i * 150}">
            <img src="${escapeHtml(p.photo_url || 'img/муж1.png')}" alt="${escapeHtml(p.full_name)}">
            <div class="meta">
                <h3>${escapeHtml(p.full_name)}</h3>
                <p>${escapeHtml(p.specialties)}</p>
            </div>
        </div>`).join('');
}

/* 2. API: АБОНЕМЕНТИ */
export async function populatePlans() {
    const grid = document.getElementById('plansGrid');
    if (!grid) return;

    let plans = [];
    try {
        plans = await fetchPublicData('/api/membership-types/');
        if (!Array.isArray(plans)) throw new Error('Невірний формат даних API');

    } catch (error) {
        console.error("API Error (Plans):", error);
        showToast('Помилка API: Абонементи. Використовуються демо-дані.', 'error');
        // Заглушка (mock data)
        plans = [
            { id: 1, name: 'BASIC', amount: '800.00', period_months: 1, features: ['Доступ до обладнання', 'Безлімітний час'] },
            { id: 2, name: 'PLUS', amount: '1200.00', period_months: 1, features: ['Усі переваги BASIC', '2 перс. тренування', 'Консультації'] },
            { id: 3, name: 'VIP', amount: '2500.00', period_months: 1, features: ['Усі переваги PLUS', 'Безлімітні перс. тренування', 'VIP доступ'] }
        ];
    }

    // Прив'язуємо 'onclick' до глобального window, бо це модуль
    window.handleBuyPlan = (plan) => {
        const token = getToken(); // Перевіряємо токен
        if (!token) return showToast('Спершу увійдіть у систему, щоб придбати', 'error');
        // TODO: Замінити це на fetch() до API /api/buy-plan/
        showToast(`Оформлення замовлення: ${escapeHtml(plan)}`, 'success');
    }

    grid.innerHTML = plans.map((p, i) => {
        const isFeatured = p.name.toUpperCase() === 'PLUS';
        const btnClass = isFeatured ? 'btn-primary' : 'btn-ghost';

        return `
            <div class="pricing-card ${isFeatured ? 'pricing-card--featured' : ''}" data-aos="zoom-in" data-aos-delay="${i * 150}">
                <h3 class="plan-name">${escapeHtml(p.name)}</h3>
                <p class="plan-price">₴${escapeHtml(parseFloat(p.amount).toFixed(0))}<span>/ ${p.period_months} ${p.period_months === 1 ? 'місяць' : 'міс.'}</span></p>
                <ul class="plan-features">
                    ${p.features && Array.isArray(p.features) ? p.features.map(f => `<li><i class="fas fa-check-circle"></i> ${escapeHtml(f)}</li>`).join('') : `<li>${escapeHtml(p.description || 'Всі базові послуги')}</li>`}
                </ul>
                <button class="btn ${btnClass}" onclick="handleBuyPlan('${escapeHtml(p.name)}')">Придбати онлайн</button>
            </div>`;
    }).join('');
}