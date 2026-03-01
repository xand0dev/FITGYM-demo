export default function Contacts() {
    return (
        <section id="contacts" className="py-[100px] bg-white overflow-hidden">
            <div className="container mx-auto max-w-[1200px] px-5 lg:px-8 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
                
                {/* ЛІВА ЧАСТИНА */}
                <div className="flex-1 w-full" data-aos="fade-right">
                    <h2 className="font-['Montserrat',sans-serif] font-black italic text-[clamp(2rem,5vw,3.2rem)] uppercase leading-none tracking-[-1px] text-black mb-10">
                        Контакти та <br />
                        <span 
                            className="text-transparent opacity-80" 
                            style={{ WebkitTextStroke: '1.5px #000' }}
                        >
                            Розташування
                        </span>
                    </h2>

                    <div>
                        <span className="font-sans text-[0.7rem] font-extrabold uppercase tracking-[2px] text-primary block mb-1.5">Телефон</span>
                        <p className="font-sans text-[1.15rem] font-bold text-black mb-[30px] leading-[1.2]">+38 (097) 123-45-67</p>
                    </div>

                    <div>
                        <span className="font-sans text-[0.7rem] font-extrabold uppercase tracking-[2px] text-primary block mb-1.5">Email</span>
                        <p className="font-sans text-[1.15rem] font-bold text-black mb-[30px] leading-[1.2]">info@fitgym.ua</p>
                    </div>

                    <div>
                        <span className="font-sans text-[0.7rem] font-extrabold uppercase tracking-[2px] text-primary block mb-1.5">Адреса</span>
                        <p className="font-sans text-[1.15rem] font-bold text-black mb-[30px] leading-[1.2]">вул. Вінницька, 42а, <br/> м. Бердичів</p>
                    </div>

                    <div className="w-[40px] h-[4px] bg-primary"></div>
                </div>

                {/* ПРАВА ЧАСТИНА: ЧОРНА МАПА */}
                <div className="flex-[1.4] w-full" data-aos="fade-left">
                    <div className="border-[8px] border-black shadow-[10px_10px_0px_#ff0000] lg:shadow-[12px_12px_0px_#ff0000] relative bg-black transition-all duration-300">
                        <iframe 
                            loading="lazy" 
                            title="Мапа Бердичів"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2551.4876!2d28.5836!3d49.8956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDUzJzQ0LjIiTiAyOMKwMzUnMDAuOSJF!5e0!3m2!1suk!2sua!4v1645171200000!5m2!1suk!2sua"
                            className="w-full h-[300px] lg:h-[420px] border-0 block grayscale invert contrast-[1.2] transition-all duration-300 hover:grayscale-0 hover:invert-0 hover:contrast-100"
                            allowFullScreen=""
                        ></iframe>
                        
                        {/* Червона крапка по центру мапи */}
                        <div className="absolute top-1/2 left-1/2 w-[18px] h-[18px] bg-primary rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_15px_rgba(255,0,0,0.5)]"></div>
                    </div>
                </div>

            </div>
        </section>
    );
}