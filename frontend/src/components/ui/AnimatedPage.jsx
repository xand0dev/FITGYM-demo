// src/components/AnimatedPage.jsx
import { motion } from 'framer-motion';

const animations = {
    initial: { opacity: 0, y: 15, filter: 'blur(5px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -15, filter: 'blur(5px)' },
};

export default function AnimatedPage({ children }) {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
        >
            {children}
        </motion.div>
    );
}