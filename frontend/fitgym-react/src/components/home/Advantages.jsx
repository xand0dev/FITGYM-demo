export default function Advantages() {
    return (
        <section id="advantages" className="relative py-[120px] bg-[url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975')] bg-cover bg-center bg-fixed overflow-hidden">
            {/* Затемнення фону */}
            <div className="absolute inset-0 bg-black/85 z-10"></div>
            
            <div className="container mx-auto max-w-[1200px] px-5 relative z-20 text-center text-white">
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black mb-[80px] tracking-tight uppercase">
                    ЧОМУ ОБИРАЮТЬ <span className="text-primary">FITGYM</span>?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
                    <div className="group bg-white/5 border-2 border-white/10 p-[60px_40px] backdrop-blur-sm transition-all duration-400 hover:bg-white hover:-translate-y-2.5 hover:border-primary cursor-default" data-aos="fade-right">
                        <i className="fas fa-user-tie text-[3rem] text-primary mb-[25px] transition-colors duration-400"></i>
                        <h3 className="text-[1.4rem] font-black mb-[15px] transition-colors duration-400 group-hover:text-black">ПРОФЕСІЙНІ ТРЕНЕРИ</h3>
                        <p className="text-[1rem] leading-[1.6] text-white/70 transition-colors duration-400 group-hover:text-black">Сертифіковані фахівці, що допоможуть досягти результату в Бердичеві.</p>
                    </div>
                    
                    <div className="group bg-white/5 border-2 border-white/10 p-[60px_40px] backdrop-blur-sm transition-all duration-400 hover:bg-white hover:-translate-y-2.5 hover:border-primary cursor-default" data-aos="fade-up">
                        <i className="fas fa-dumbbell text-[3rem] text-primary mb-[25px] transition-colors duration-400"></i>
                        <h3 className="text-[1.4rem] font-black mb-[15px] transition-colors duration-400 group-hover:text-black">СУЧАСНЕ ОБЛАДНАННЯ</h3>
                        <p className="text-[1rem] leading-[1.6] text-white/70 transition-colors duration-400 group-hover:text-black">Найкращі тренажери останнього покоління для твого прогресу.</p>
                    </div>
                    
                    <div className="group bg-white/5 border-2 border-white/10 p-[60px_40px] backdrop-blur-sm transition-all duration-400 hover:bg-white hover:-translate-y-2.5 hover:border-primary cursor-default" data-aos="fade-left">
                        <i className="fas fa-clock text-[3rem] text-primary mb-[25px] transition-colors duration-400"></i>
                        <h3 className="text-[1.4rem] font-black mb-[15px] transition-colors duration-400 group-hover:text-black">ЗРУЧНИЙ РОЗКЛАД</h3>
                        <p className="text-[1rem] leading-[1.6] text-white/70 transition-colors duration-400 group-hover:text-black">Тренування 24/7, що підлаштовуються під твій ритм життя.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}