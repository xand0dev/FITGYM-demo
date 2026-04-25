// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function Contacts() {
    return (
        <section id="contacts" className="py-24 bg-background overflow-hidden relative">
            {/* Subtle bg glow */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-[1200px] px-5 lg:px-8 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start relative z-10">

                {/* LEFT */}
                <motion.div
                    className="flex-1 w-full"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="mb-10">
                        <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Зв'язок</span>
                        <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-1">
                            Контакти та<br />
                            <span className="text-white/30">Розташування</span>
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[3px] text-primary block mb-1.5">Телефон</span>
                            <p className="font-body text-lg text-white/80">+38 (097) 123-45-67</p>
                        </div>

                        <div>
                            <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[3px] text-primary block mb-1.5">Email</span>
                            <p className="font-body text-lg text-white/80">info@fitgym.ua</p>
                        </div>

                        <div>
                            <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[3px] text-primary block mb-1.5">Адреса</span>
                            <p className="font-body text-lg text-white/80">вул. Вінницька, 42а, <br/> м. Бердичів</p>
                        </div>
                    </div>

                    <div className="w-10 h-[2px] bg-primary rounded-full mt-8" style={{ boxShadow: '0 0 8px rgba(255,0,0,0.4)' }} />
                </motion.div>

                {/* RIGHT — MAP */}
                <motion.div
                    className="flex-[1.4] w-full"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="rounded-card border border-white/10 relative bg-surface overflow-hidden"
                         style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <iframe
                            loading="lazy"
                            title="Мапа Бердичів"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2551.4876!2d28.5836!3d49.8956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDUzJzQ0LjIiTiAyOMKwMzUnMDAuOSJF!5e0!3m2!1suk!2sua!4v1645171200000!5m2!1suk!2sua"
                            className="w-full h-[300px] lg:h-[420px] border-0 block invert brightness-90 contrast-[1.1] hue-rotate-180 saturate-[0.3] transition-all duration-700 hover:brightness-100 hover:saturate-[0.5]"
                            allowFullScreen=""
                        />

                        {/* Red dot center */}
                        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}