console.log("main1.js запущено...");

// Знаходимо наш <div> на сторінці
const calendarEl = document.getElementById('calendar');

// Перевіряємо, чи існує <div> і чи завантажився FullCalendar
if (calendarEl && typeof FullCalendar !== 'undefined') {

    console.log("Знайшов <div id='calendar'> і FullCalendar завантажено. Малюю...");

    // Створюємо календар
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'uk',
        events: [
            {
                title: '✅ ТЕСТ ПРОЙШОВ УСПІШНО',
                start: new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
            }
        ]
    });

    // Малюємо
    calendar.render();

    console.log("Команда calendar.render() була викликана.");

} else {
    if (!calendarEl) console.error("ПОМИЛКА: Не можу знайти <div id='calendar'>!");
    if (typeof FullCalendar === 'undefined') console.error("ПОМИЛКА: FullCalendar 'undefined'!");
}