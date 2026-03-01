import { usePublicData } from '../../hooks/useFitQuery';

export default function Trainers() {
    // Дані завантажуються виключно в цьому компоненті
    const { data: trainers = [], isLoading: isTrainersLoading } = usePublicData('trainers', '/api/instructors/');

    return (
        <section id="trainers" className="py-[100px] px-5 bg-white">
            <div className="container mx-auto max-w-[1200px]">
                <h2 className="text-center text-[clamp(2.5rem,5vw,3rem)] font-black mb-[60px] uppercase tracking-wide">
                    Команда <span className="text-primary">профі</span>
                </h2>
                
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[30px]">
                    {isTrainersLoading ? (
                        // БОЙОВІ СКЕЛЕТОНИ (Tailwind Pulse)
                        [1, 2, 3, 4].map((skel) => (
                            <div key={skel} className="border-[3px] border-black bg-white">
                                <div className="h-[350px] bg-[#f0f0f0] animate-pulse"></div>
                                <div className="p-[30px] flex flex-col items-center">
                                    <div className="h-[24px] bg-[#e0e0e0] rounded w-[70%] mb-2.5 animate-pulse"></div>
                                    <div className="h-[16px] bg-[#e0e0e0] rounded w-[50%] animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // РЕАЛЬНІ ДАНІ
                        trainers.map(t => (
                            <div 
                                key={t.id} 
                                className="group border-[3px] border-black bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-[10px_10px_0px_#ff0000] cursor-pointer" 
                                data-aos="zoom-in"
                            >
                                <div className="h-[350px] bg-[#111] text-white flex items-center justify-center overflow-hidden relative">
                                    <i className="fas fa-user text-[6rem] opacity-20 transition-transform duration-500 group-hover:scale-110"></i>
                                </div>
                                <div className="p-[30px] text-center bg-white">
                                    <h3 className="font-black uppercase m-0 mb-2.5 text-[1.4rem] text-black">
                                        {t.full_name || t.name}
                                    </h3>
                                    <p className="text-primary font-extrabold text-[0.9rem] tracking-[1px] uppercase m-0">
                                        {t.specialties || t.specialization}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}