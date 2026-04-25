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
    const SLIDE_WIDTH = 320; 

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
        <section className="bg-background py-24">
            <div className="container mx-auto px-5 lg:px-8">
                <div className="mb-10 border-l-[3px] border-primary pl-5">
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Галерея</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-1">
                        Наші <span className="text-gradient-red">Тренування</span>
                    </h2>
                </div>

                <div className="overflow-hidden cursor-grab">
                    <div 
                        className="flex" 
                        style={{ 
                            transition: offset === 0 ? 'none' : 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: `translate3d(-${offset}px, 0, 0)` 
                        }}
                    >
                        {INFINITE_IMAGES.map((src, index) => (
                            <div key={index} className="group relative flex-[0_0_300px] mr-5 h-[400px] overflow-hidden bg-black">
                                {/* Рамка при наведенні (заміна ::after) */}
                                <div className="absolute inset-0 border-[0px] border-primary pointer-events-none transition-all duration-300 group-hover:border-[10px] z-10"></div>
                                
                                {/* Червона плашка знизу */}
                                <div className="absolute -bottom-[50px] left-0 w-full bg-primary text-white p-2.5 text-center font-black text-[0.8rem] z-[2] uppercase transition-all duration-300 group-hover:bottom-0">
                                    <span>FITGYM PRO</span>
                                </div>
                                
                                {/* Фото */}
                                <img 
                                    src={src} 
                                    alt={`Training ${index}`} 
                                    className="w-full h-full object-cover grayscale contrast-110 opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-110 group-hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Індикатори (крапки) */}
                <div className="flex justify-center gap-2.5 mt-[30px]">
                    {IMAGES.map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${offset / SLIDE_WIDTH === i ? 'bg-primary shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'bg-white/15'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}