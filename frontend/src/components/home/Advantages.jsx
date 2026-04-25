// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

const advantages = [
    { icon: 'fas fa-user-tie',  title: 'ПРОФЕСІЙНІ ТРЕНЕРИ', desc: 'Сертифіковані фахівці, що допоможуть досягти результату в Бердичеві.' },
    { icon: 'fas fa-dumbbell',  title: 'СУЧАСНЕ ОБЛАДНАННЯ', desc: 'Найкращі тренажери останнього покоління для твого прогресу.' },
    { icon: 'fas fa-clock',     title: 'ЗРУЧНИЙ РОЗКЛАД',    desc: 'Тренування 24/7, що підлаштовуються під твій ритм життя.' },
];

export default function Advantages() {
    return (
        <section id="advantages" className="relative py-24 bg-[url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975')] bg-cover bg-center bg-fixed overflow-hidden">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/85 z-10" />

            <div className="container mx-auto max-w-[1200px] px-5 relative z-20 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Переваги</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2 mb-16">
                        ЧОМУ ОБИРАЮТЬ <span className="text-gradient-red">FITGYM</span>?
                    </h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ staggerChildren: 0.15 }}
                >
                    {advantages.map((adv, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="group glass-card p-12 transition-all duration-300 hover:border-primary/40 cursor-default"
                        >
                            <div className="w-16 h-16 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                                <i className={`${adv.icon} text-2xl text-primary`} />
                            </div>
                            <h3 className="font-heading text-lg font-semibold uppercase tracking-wider text-white mb-4">{adv.title}</h3>
                            <p className="font-body text-sm leading-relaxed text-white/50 group-hover:text-white/70 transition-colors duration-300">{adv.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}