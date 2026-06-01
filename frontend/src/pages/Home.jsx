import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Компоненти
import Hero from '../components/home/Hero';
import Stats from '../components/home/Stats'; 
import Categories from '../components/home/Categories'; 
import Advantages from '../components/home/Advantages';
import Schedule from '../components/home/Schedule';
import BMICalculator from '../components/home/BMICalculator';
import Carousel from '../components/home/Carousel'; 
import Trainers from '../components/home/Trainers';
import Plans from '../components/home/Plans';
import Contacts from '../components/home/Contacts';

export default function Home() {
    useEffect(() => {
        // Ініціалізація анімацій при скролі
        AOS.init({ 
            duration: 1000, 
            once: true,
            offset: 120 
        });
    }, []);

    return (
        <main className="bg-background overflow-x-hidden">
            <Hero />
            <Stats />
            <Categories />
            <Advantages />
            <Schedule />
            <BMICalculator />
            <Carousel /> 
            <Trainers />
            <Plans />
            <Contacts />
        </main>
    );
}