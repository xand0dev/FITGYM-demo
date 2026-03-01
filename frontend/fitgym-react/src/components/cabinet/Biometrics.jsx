import { useState, useEffect } from 'react';

export default function Biometrics() {
    const [weight, setWeight] = useState(() => Number(localStorage.getItem('gym_weight')) || 85);
    const [height, setHeight] = useState(() => Number(localStorage.getItem('gym_height')) || 180);
    const [goal, setGoal] = useState(() => Number(localStorage.getItem('gym_goal')) || 90);
    
    useEffect(() => {
        localStorage.setItem('gym_weight', weight);
        localStorage.setItem('gym_height', height);
        localStorage.setItem('gym_goal', goal);
    }, [weight, height, goal]);

    const bmi = height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : 0;
    const progressToGoal = Math.min(100, Math.round((weight / goal) * 100));

    return (
        <div className="p-[20px] sm:p-[30px] rounded-[24px] border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 mb-[30px] bg-[var(--c-card)]" data-aos="fade-up">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-[20px]">
                <h4 className="text-primary font-black tracking-[1px] m-0">БІОМЕТРІЯ</h4>
                <div className="bg-primary text-white px-3 py-1 rounded-lg font-black text-[0.8rem] w-fit">BMI: {bmi}</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] mb-[20px]">
                <div className="p-[20px] rounded-[20px] border border-[var(--c-border)] bg-[var(--c-input)] transition-colors duration-300">
                    <label className="block text-[0.75rem] font-bold text-[#888]">ВАГА (КГ)</label>
                    <div className="text-[2.5rem] font-black">{weight}</div>
                    <input type="range" min="40" max="150" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} className="w-full cursor-pointer accent-[#ff0000]" />
                </div>
                <div className="p-[20px] rounded-[20px] border border-[var(--c-border)] bg-[var(--c-input)] transition-colors duration-300">
                    <label className="block text-[0.75rem] font-bold text-[#888]">ЦІЛЬ (КГ)</label>
                    <input type="number" value={goal} onChange={(e)=>setGoal(Number(e.target.value))} className="w-[100px] text-[2.5rem] font-black bg-transparent border-none outline-none text-[var(--c-text)]" />
                    <div className="h-[8px] mt-[15px] bg-[#88888840] rounded-[10px] overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_10px_#ff0000] transition-all duration-500" style={{width: `${progressToGoal}%`}}></div>
                    </div>
                </div>
            </div>

            <div className="flex items-center">
                <label className="font-bold text-[#888] mr-2.5">ЗРІСТ (CM): </label>
                <input type="number" value={height} onChange={(e)=>setHeight(Number(e.target.value))} className="w-[80px] text-center font-black p-2.5 rounded-[10px] border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] outline-none transition-colors duration-300 focus:border-primary focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]" />
            </div>
        </div>
    );
}