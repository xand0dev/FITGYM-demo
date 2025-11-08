// Цей скрипт виконається, коли сторінка завантажиться
document.addEventListener('DOMContentLoaded', () => {

    console.log("JavaScript завантажено. Намагаюся отримати дані...");

    // Йдемо на твій "бек-енд" за даними
    fetch('http://127.0.0.1:8000/api/instructors/')
        .then(response => {
            // Перетворюємо відповідь у JSON
            return response.json();
        })
        .then(data => {
            // Якщо все добре, виводимо дані в консоль
            console.log("Успіх! Отримані дані:", data);

            // Знаходимо <ul> на сторінці
            const list = document.getElementById('instructor-list');
            
            // Створюємо <li> для кожного тренера
            data.forEach(instructor => {
                const li = document.createElement('li');
                li.textContent = `${instructor.full_name} (${instructor.specialties})`;
                list.appendChild(li);
            });
        })
        .catch(error => {
            // Якщо сталася помилка, виводимо її
            console.error("!!! ПОМИЛКА !!!:", error);
        });
});