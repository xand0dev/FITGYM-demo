/* ===========================
   modules/calculator.js — Логіка ІМТ-калькулятора
   =========================== */

export function setupImtCalculator() {
    const form = document.getElementById('imtForm');
    const resultBox = document.getElementById('imtResultBox');
    const tableRows = document.querySelectorAll('.imt-table tbody tr');

    if (!form) return;

    const calculateImt = (height, weight) => {
        // Формула: Вага (кг) / [Зріст (м)]^2
        const heightM = height / 100;
        return weight / (heightM * heightM);
    };

    const determineStatus = (imt) => {
        if (imt < 18.5) return { status: 'Недостатня вага', class: 'underweight' };
        if (imt >= 18.5 && imt <= 24.9) return { status: 'Нормальна вага', class: 'normal' };
        if (imt >= 25.0 && imt <= 29.9) return { status: 'Зайва вага', class: 'overweight' };
        return { status: 'Ожиріння', class: 'obese' };
    };

    const highlightStatus = (className) => {
        tableRows.forEach(row => row.classList.remove('active'));
        const targetRow = document.querySelector(`.imt-table tr[data-status="${className}"]`);
        if (targetRow) {
            targetRow.classList.add('active');
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const height = parseFloat(document.getElementById('imt_height').value);
        const weight = parseFloat(document.getElementById('imt_weight').value);
        const gender = document.getElementById('imt_gender').value;
        const age = document.getElementById('imt_age').value;
        
        if (isNaN(height) || isNaN(weight) || !gender || !age) {
             resultBox.innerHTML = 'Будь ласка, заповніть усі поля.';
             resultBox.className = 'imt-result-box';
             highlightStatus(null);
             return;
        }

        const imtValue = calculateImt(height, weight);
        const status = determineStatus(imtValue);
        
        // Відображення результату
        resultBox.innerHTML = `Ваш ІМТ: <strong>${imtValue.toFixed(1)}</strong> (${status.status})`;
        resultBox.className = `imt-result-box ${status.class}`;
        
        // Підсвічування таблиці
        highlightStatus(status.class);
    });
}