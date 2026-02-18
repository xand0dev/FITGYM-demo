import React, { useState } from 'react';

const CategoryCard = ({ title, img, isLarge, isTall, onClick }) => (
    <div 
        className="category-card" 
        onClick={onClick}
        style={{
            position: 'relative',
            gridColumn: isLarge ? 'span 2' : 'span 1',
            gridRow: isTall ? 'span 2' : 'span 1',
            overflow: 'hidden',
            border: '3px solid #000',
            background: '#fff',
            height: '100%',
            minHeight: '220px',
            cursor: 'pointer'
        }}
    >
        <img src={img} alt={title} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(100%) brightness(0.7)',
            transition: '0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} className="cat-img" />
        
        <div className="cat-overlay" style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.4s'
        }}>
            <h3 style={{
                fontSize: 'clamp(1.2rem, 2vw, 2rem)',
                fontWeight: '950',
                textTransform: 'uppercase',
                color: '#fff',
                letterSpacing: '3px',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>{title}</h3>
            <div className="cat-line" style={{ width: '0%', height: '4px', background: '#ff0000', marginTop: '10px', transition: '0.5s' }}></div>
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
        <section id="categories" style={{ padding: '100px 0', background: '#f9f9f9' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
                <div style={{ marginBottom: '50px', borderLeft: '8px solid #ff0000', paddingLeft: '20px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
                        ОБЕРИ СВІЙ <span style={{color: '#ff0000'}}>ШЛЯХ</span>
                    </h2>
                </div>
                
                <div className="bento-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gridAutoRows: '240px',
                    gap: '20px'
                }}>
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
            {current && (
                <div className="modal-photo-overlay" onClick={() => setSelectedId(null)}>
                    {/* Фонове зображення */}
                    <div className="modal-bg-image" style={{ backgroundImage: `url(${current.img})` }}></div>
                    
                    <div className="modal-photo-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-tag">FITGYM / КАТЕГОРІЯ</span>
                            <button className="modal-close-x" onClick={() => setSelectedId(null)}>ЗАКРИТИ ×</button>
                        </div>
                        
                        <div className="modal-main">
                            <h2 className="modal-big-title">{current.title}</h2>
                            <p className="modal-text-desc">{current.desc}</p>
                            <div className="modal-footer-cta">
                                <a href="#plans" className="modal-link-btn" onClick={() => setSelectedId(null)}>Обрати абонемент →</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .category-card:hover .cat-img { filter: grayscale(0%) brightness(0.6); transform: scale(1.05); }
                .category-card:hover .cat-overlay { background: rgba(255, 0, 0, 0.3) !important; }
                .category-card:hover .cat-line { width: 60% !important; }

                .modal-photo-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 100000;
                    display: flex; align-items: center; justify-content: center;
                    background: #000;
                    animation: fadeIn 0.5s ease;
                }

                .modal-bg-image {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.3); /* Затемнення фото */
                    transition: 0.5s;
                }

                .modal-photo-content {
                    position: relative;
                    width: 100%;
                    max-width: 1000px;
                    padding: 60px;
                    color: #fff;
                    animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .modal-header { display: flex; justify-content: space-between; margin-bottom: 100px; }
                .modal-tag { font-weight: 900; letter-spacing: 4px; color: #ff0000; font-size: 0.8rem; }
                .modal-close-x { background: none; border: none; color: #fff; font-weight: 700; cursor: pointer; letter-spacing: 1px; }

                .modal-big-title { 
                    font-size: clamp(3rem, 10vw, 7rem); 
                    font-weight: 950; 
                    text-transform: uppercase; 
                    margin-bottom: 30px; 
                    line-height: 0.85;
                    letter-spacing: -4px;
                }

                .modal-text-desc { 
                    font-size: 1.3rem; 
                    max-width: 600px; 
                    line-height: 1.6; 
                    color: rgba(255,255,255,0.8);
                    font-weight: 500;
                }

                .modal-footer-cta { margin-top: 50px; }
                .modal-link-btn { 
                    color: #fff; 
                    font-size: 1.8rem; 
                    font-weight: 900; 
                    text-decoration: none; 
                    border-bottom: 5px solid #ff0000;
                    padding-bottom: 5px;
                    transition: 0.3s;
                }
                .modal-link-btn:hover { color: #ff0000; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(40px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }

                @media (max-width: 768px) {
                    .modal-photo-content { padding: 30px; }
                    .modal-header { margin-bottom: 50px; }
                    .modal-big-title { letter-spacing: -2px; }
                }

                @media (max-width: 600px) {
                    .bento-grid { grid-template-columns: 1fr !important; grid-auto-rows: 250px !important; }
                    .category-card { grid-column: span 1 !important; grid-row: span 1 !important; }
                }
            `}</style>
        </section>
    );
}