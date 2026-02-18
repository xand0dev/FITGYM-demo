import { useState, useEffect, useRef } from 'react';

const IMAGES = [
    '/img/training_1.jpg',
    '/img/training_2.jpg',
    '/img/training_3.jpg',
    '/img/training_4.jpg',
    '/img/training_5.jpg',
];

// Подвоюємо масив для створення ефекту безкінечності
const INFINITE_IMAGES = [...IMAGES, ...IMAGES];

export default function Carousel() {
    const [offset, setOffset] = useState(0);
    const containerRef = useRef(null);
    const SLIDE_WIDTH = 320; // Трохи збільшимо ширину слайда для солідності

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset((prev) => {
                const maxOffset = IMAGES.length * SLIDE_WIDTH;
                // Якщо дійшли до середини дубльованого списку, плавно повертаємось
                return prev >= maxOffset ? 0 : prev + SLIDE_WIDTH;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="carousel-section" style={{ background: '#fff', padding: '100px 0' }}>
            <div className="container">
                <div className="carousel-header" style={{ marginBottom: '40px', borderLeft: '8px solid #ff0000', paddingLeft: '20px' }}>
                    <h2 style={{ 
                        fontFamily: "'Montserrat', sans-serif", 
                        fontWeight: '900', 
                        fontSize: '2.5rem', 
                        textTransform: 'uppercase', 
                        margin: 0 
                    }}>
                        Наші <span style={{ color: '#ff0000' }}>Тренування</span>
                    </h2>
                </div>

                <div className="carousel-container" style={{ overflow: 'hidden', cursor: 'grab' }}>
                    <div 
                        className="carousel-wrapper" 
                        style={{ 
                            display: 'flex',
                            transition: offset === 0 ? 'none' : 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: `translate3d(-${offset}px, 0, 0)` 
                        }}
                    >
                        {INFINITE_IMAGES.map((src, index) => (
                            <div key={index} className="carousel-slide-modern">
                                <div className="slide-overlay">
                                    <span>FITGYM PRO</span>
                                </div>
                                <img src={src} alt={`Training ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Індикатори (крапки) */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    {IMAGES.map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                width: '12px', 
                                height: '12px', 
                                borderRadius: '50%', 
                                background: offset / SLIDE_WIDTH === i ? '#ff0000' : '#ddd',
                                transition: '0.3s'
                            }} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}