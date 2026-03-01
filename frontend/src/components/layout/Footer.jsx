import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-[80px] pb-[30px] border-t-[5px] border-primary">
            <div className="container mx-auto px-5 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] gap-10 md:gap-[60px] mb-[60px] text-center md:text-left">
                    
                    {/* Лого та опис */}
                    <div className="mx-auto md:mx-0">
                        <h2 className="text-[2.5rem] font-[950] mb-5 tracking-[-2px]">
                            FIT<span className="text-primary">GYM</span>
                        </h2>
                        <p className="text-[#888] leading-relaxed max-w-[350px] mx-auto md:mx-0">
                            Найсучасніший фітнес-центр у Бердичеві. Твій результат — наш пріоритет. 
                            Працюємо 24/7 для твоєї досконалості.
                        </p>
                        <div className="flex justify-center md:justify-start gap-5 mt-[25px]">
                            <a href="#" className="w-10 h-10 bg-[#222] flex items-center justify-center text-white no-underline transition-all duration-300 hover:bg-primary hover:-translate-y-1">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="w-10 h-10 bg-[#222] flex items-center justify-center text-white no-underline transition-all duration-300 hover:bg-primary hover:-translate-y-1">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="w-10 h-10 bg-[#222] flex items-center justify-center text-white no-underline transition-all duration-300 hover:bg-primary hover:-translate-y-1">
                                <i className="fab fa-tiktok"></i>
                            </a>
                        </div>
                    </div>

                    {/* Навігація */}
                    <div>
                        <h4 className="uppercase font-black mb-[25px] tracking-[1px]">Навігація</h4>
                        <ul className="list-none p-0 m-0">
                            <li className="mb-3">
                                <a href="#categories" className="text-[#888] no-underline font-semibold transition-all duration-300 hover:text-primary hover:pl-1">Тренування</a>
                            </li>
                            <li className="mb-3">
                                <a href="#trainers" className="text-[#888] no-underline font-semibold transition-all duration-300 hover:text-primary hover:pl-1">Тренери</a>
                            </li>
                            <li className="mb-3">
                                <a href="#plans" className="text-[#888] no-underline font-semibold transition-all duration-300 hover:text-primary hover:pl-1">Тарифи</a>
                            </li>
                            <li className="mb-3">
                                <a href="#schedule" className="text-[#888] no-underline font-semibold transition-all duration-300 hover:text-primary hover:pl-1">Розклад</a>
                            </li>
                        </ul>
                    </div>

                    {/* Контакти */}
                    <div>
                        <h4 className="uppercase font-black mb-[25px] tracking-[1px]">Контакти</h4>
                        <p className="text-[#888] mb-[15px] flex items-center justify-center md:justify-start gap-3">
                            <i className="fas fa-map-marker-alt text-primary"></i> м. Бердичів, вул. Європейська, 15
                        </p>
                        <p className="text-[#888] mb-[15px] flex items-center justify-center md:justify-start gap-3">
                            <i className="fas fa-phone text-primary"></i> +38 (097) 123-45-67
                        </p>
                        <p className="text-[#888] mb-[15px] flex items-center justify-center md:justify-start gap-3">
                            <i className="fas fa-envelope text-primary"></i> info@fitgym.ua
                        </p>
                    </div>

                </div>

                <div className="border-t border-[#222] pt-[30px] flex flex-col md:flex-row justify-between items-center text-[#444] text-[0.9rem] font-bold gap-[10px]">
                    <p className="m-0">&copy; 2026 FITGYM BERDYCHIV. Всі права захищені.</p>
                </div>
            </div>
        </footer>
    );
}