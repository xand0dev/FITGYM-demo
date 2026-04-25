// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { usePublicData } from '../../hooks/useFitQuery';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

export default function Trainers() {
    // Дані завантажуються виключно в цьому компоненті
    const { data: trainers = [], isLoading: isTrainersLoading } = usePublicData('trainers', '/api/instructors/');

    return (
        <section id="trainers" className="py-24 px-5 bg-background relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-[1200px] relative z-10">
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Наша команда</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2">
                        Команда <span className="text-gradient-red">профі</span>
                    </h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ staggerChildren: 0.12 }}
                >
                    {isTrainersLoading ? (
                        // Skeleton loaders
                        [1, 2, 3, 4].map((skel) => (
                            <div key={skel} className="glass-card overflow-hidden">
                                <div className="h-[350px] bg-white/[0.03] animate-pulse" />
                                <div className="p-6 flex flex-col items-center">
                                    <div className="h-5 bg-white/[0.06] rounded w-[70%] mb-2.5 animate-pulse" />
                                    <div className="h-3 bg-white/[0.04] rounded w-[50%] animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : (
                        trainers.map(t => (
                            <motion.div
                                key={t.id}
                                variants={fadeInUp}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                className="group glass-card overflow-hidden transition-all duration-300 hover:border-primary/30 cursor-pointer"
                            >
                                <div className="h-[350px] bg-surface text-white flex items-center justify-center overflow-hidden relative">
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                                    <i className="fas fa-user text-[5rem] text-white/[0.06] transition-all duration-500 group-hover:scale-110 group-hover:text-white/[0.1]" />
                                    {/* Red glow on hover */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-primary/0 group-hover:bg-primary/10 blur-[40px] rounded-full transition-all duration-500" />
                                </div>
                                <div className="p-6 text-center relative">
                                    <h3 className="font-heading text-base font-semibold uppercase tracking-wider text-white mb-2">
                                        {t.full_name || t.name}
                                    </h3>
                                    <p className="font-body text-primary/80 text-xs uppercase tracking-[2px]">
                                        {t.specialties || t.specialization}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </section>
    );
}