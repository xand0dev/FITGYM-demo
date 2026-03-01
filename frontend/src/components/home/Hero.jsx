import { useAuth } from '../../context/AuthContext';

export default function Hero() {
    const { user } = useAuth();

    return (
        <section className="py-20 bg-white text-black overflow-hidden">
            <div className="container mx-auto px-5 lg:px-8 flex flex-col lg:flex-row items-center justify-between min-h-[600px] pt-12 lg:pt-0 gap-10 lg:gap-0">
                
                {/* ЛІВА ЧАСТИНА: ТЕКСТ */}
                <div 
                    className="flex-1 w-full lg:min-w-[350px] lg:pr-5 z-[2] flex flex-col items-center lg:items-start text-center lg:text-left" 
                    data-aos="fade-right"
                >
                    <h1 className="text-[clamp(2.5rem,10vw,4rem)] lg:text-[clamp(3rem,6vw,5.5rem)] font-black leading-[0.9] mb-6 uppercase text-[#111] tracking-[-2px]">
                        TOP<br/>
                        SCORER TO<br/>
                        <span className="text-[#aaa]">THE FINAL</span><br/>
                        <span className="text-[#ddd]">MATCH</span>
                    </h1>
                    
                    <p className="text-lg text-[#666] mb-10 max-w-[480px] leading-relaxed font-medium">
                        Ваша фітнесова подорож починається тут. Приєднуйтесь до нашого клубу та досягайте цілей з професіоналами.
                    </p>

                    <div className="w-full sm:w-auto">
                        <a 
                            href="#plans" 
                            className="inline-block w-full sm:w-auto bg-[#111] hover:bg-primary text-white py-4 px-11 rounded-md font-bold uppercase text-sm tracking-[1px] transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,0,0,0.4)] hover:-translate-y-1"
                        >
                            ОБРАТИ АБОНЕМЕНТ
                        </a>
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: ФОТО */}
                <div 
                    className="flex-1 w-full max-w-[500px] lg:max-w-none lg:min-w-[350px] relative flex justify-center mt-10 lg:mt-0" 
                    data-aos="fade-left"
                >
                    <img 
                        src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
                        alt="Athlete" 
                        className="w-full h-auto block object-contain max-h-[650px] grayscale contrast-110 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
                    />
                </div>

            </div>
        </section>
    );
}