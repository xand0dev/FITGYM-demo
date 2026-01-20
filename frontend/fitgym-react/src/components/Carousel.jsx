// src/components/Carousel.jsx
import { useState, useEffect, useRef } from 'react';

// Список фотографій (можна додати більше)
const IMAGES = [
    '/img/training_1.jpg',
    '/img/training_2.jpg',
    '/img/training_3.jpg',
    '/img/training_4.jpg',
    '/img/training_5.jpg',
    '/img/training_1.jpg', // Повтор для візуальної маси
    '/img/training_2.jpg'
];

export default function Carousel() {
    const [offset, setOffset] = useState(0);
    const timeoutRef = useRef(null);

    // Ширина одного слайда + відступи (240px ширина + 10px + 10px margin = 260px)
    // Це значення взято з твого файлу 2-components.css
    const SLIDE_WIDTH = 260; 

    function resetTimeout() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    useEffect(() => {
        resetTimeout();
        
        // Автоматична прокрутка
        timeoutRef.current = setTimeout(() => {
            setOffset((prevOffset) => {
                // Якщо дійшли до кінця (або майже), повертаємось на початок
                const maxOffset = (IMAGES.length - 1) * SLIDE_WIDTH;
                // Якщо зміщення стає занадто великим, скидаємо на 0, інакше рухаємо далі
                return prevOffset >= maxOffset - (SLIDE_WIDTH * 3) ? 0 : prevOffset + SLIDE_WIDTH;
            });
        }, 3000); // 3 секунди

        return () => resetTimeout();
    }, [offset]);

    return (
        <section className="carousel-section">
            <div className="carousel-container">
                <div 
                    className="carousel-wrapper" 
                    style={{ transform: `translate3d(-${offset}px, 0, 0)` }}
                >
                    {IMAGES.map((src, index) => (
                        <div key={index} className="carousel-slide">
                            <img src={src} alt={`Training ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}