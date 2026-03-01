import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const CategoryCard = ({ title, img, isLarge, isTall, onClick }) => (
    <div 
        className={`group relative overflow-hidden border-[3px] border-black bg-white h-full min-h-[220px] md:min-h-[240px] cursor-pointer ${isLarge ? 'md:col-span-2' : 'col-span-1'} ${isTall ? 'md:row-span-2' : 'row-span-1'}`} 
        onClick={onClick}
    >
        <img src={img} alt={title} className="w-full h-full object-cover grayscale brightness-70 transition-all duration-800 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:grayscale-0 group-hover:brightness-60 group-hover:scale-105" />
        
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-colors duration-400 group-hover:bg-primary/30">
            <h3 className="text-[clamp(1.2rem,2vw,2rem)] font-black uppercase text-white tracking-[3px] text-center drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
                {title}
            </h3>
            <div className="w-0 h-1 bg-primary mt-2.5 transition-all duration-500 group-hover:w-[60%]"></div>
        </div>
    </div>
);

export default function Categories() {
    const [selectedId, setSelectedId] = useState(null);

    const categoriesData = [
        { id: 1, title: "Важка атлетика", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48", isLarge: true, desc: "Робота з вільними вагами для нарощування м'язової маси та сили. Професійні помости та грифи для твого прогресу." },
        { id: 2, title: "Кардіо зона", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c", isTall: true, desc: "Сучасні бігові доріжки та еліптичні тренажери для зміцнення серця та спалювання калорій." },
        { id: 3, title: "Йога та Flex", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b", desc: "Гнучкість, баланс та ментальне здоров'я. Ідеально підходить для відновлення після навантажень." },
        { id: 4, title: "Кросфіт", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", desc: "Високоінтенсивні функціональні тренування для справжніх атлетів. Витривалість на межі можливостей." },
        { id: 5, title: "Персональні заняття", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b", isLarge: true, desc: "Індивідуальний підхід від наших топ-тренерів. Програма, розроблена спеціально під твої цілі." }
    ];

    const current = categoriesData.find(c => c.id === selectedId);

    return (
        <section id="categories" className="py-[100px] bg-[#f9f9f9]">
            <div className="container mx-auto max-w-[1200px] px-5 md:px-[5%]">
                <div className="mb-[50px] border-l-[8px] border-primary pl-5">
                    <h2 className="text-[clamp(2rem,5vw,3rem)] font-black uppercase m-0">
                        ОБЕРИ СВІЙ <span className="text-primary">ШЛЯХ</span>
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] auto-rows-[250px] md:auto-rows-[240px] gap-5">
                    {categoriesData.map(cat => (
                        <CategoryCard 
                            key={cat.id}
                            title={cat.title} 
                            img={cat.img} 
                            isLarge={cat.isLarge} 
                            isTall={cat.isTall}
                            onClick={() => setSelectedId(cat.id)} 
                        />
                    ))}
                </div>
            </div>

            {/* ПОВНОЕКРАННЕ ВІКНО З ФОТОМ */}
            {current && createPortal(
                <div className="fixed inset-0 w-screen h-screen z-[100000] flex items-center justify-center bg-black animate-fadeIn" onClick={() => setSelectedId(null)}>
                    {/* Фонове зображення */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center brightness-30 transition-all duration-500" 
                        style={{ backgroundImage: `url(${current.img})` }}
                    ></div>
                    
                    <div className="relative w-full max-w-[1000px] p-[30px] md:p-[60px] text-white animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between mb-[50px] md:mb-[100px]">
                            <span className="font-black tracking-[4px] text-primary text-[0.8rem]">FITGYM / КАТЕГОРІЯ</span>
                            <button className="bg-transparent border-none text-white font-bold cursor-pointer tracking-[1px] hover:text-primary transition-colors" onClick={() => setSelectedId(null)}>ЗАКРИТИ ×</button>
                        </div>
                        
                        <div>
                            <h2 className="text-[clamp(3rem,10vw,7rem)] font-black uppercase mb-[30px] leading-[0.85] tracking-[-2px] md:tracking-[-4px]">{current.title}</h2>
                            <p className="text-[1.3rem] max-w-[600px] leading-[1.6] text-white/80 font-medium">{current.desc}</p>
                            <div className="mt-[50px]">
                                <a href="#plans" className="text-white text-[1.8rem] font-black no-underline border-b-[5px] border-primary pb-1 transition-colors duration-300 hover:text-primary" onClick={() => setSelectedId(null)}>Обрати абонемент →</a>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Залишаємо тільки keyframes, щоб не мучити tailwind.config.js */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.5s ease; }
                
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
            `}</style>
        </section>
    );
}