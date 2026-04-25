import { useState } from 'react';

export default function BMICalculator() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [activity, setActivity] = useState('');
    
    const [result, setResult] = useState(null);

    const calculateBMI = (e) => {
        e.preventDefault();
        
        if (!height || !weight) return;

        // Формула: вага (кг) / (зріст (м) * зріст (м))
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        
        if (h <= 0 || w <= 0) {
            alert("Будь ласка, введіть коректні дані");
            return;
        }

        const bmiValue = (w / (h * h)).toFixed(1);
        let status = '';

        if (bmiValue < 18.5) status = 'underweight';
        else if (bmiValue >= 18.5 && bmiValue <= 24.9) status = 'normal';
        else if (bmiValue >= 25.0 && bmiValue <= 29.9) status = 'overweight';
        else status = 'obese';

        setResult({ bmi: bmiValue, status });
    };

    // Допоміжна функція для класів рядка таблиці
    const getRowClass = (statusType) => {
        const isActive = result?.status === statusType;
        return `border-b border-white/[0.06] transition-colors duration-300 ${isActive ? 'bg-primary text-white' : 'hover:bg-white/[0.04] text-white/50'}`;
    };

    const getCell1Class = (statusType) => {
        const isActive = result?.status === statusType;
        return `p-3 text-[1rem] font-semibold ${isActive ? 'text-white' : 'text-white/80'}`;
    };

    const getCell2Class = (statusType) => {
        const isActive = result?.status === statusType;
        return `p-3 text-[1rem] ${isActive ? 'text-white' : 'text-white/50'}`;
    };

    return (
        <section id="calculator" className="py-24 bg-background">
            <div className="container mx-auto max-w-[1200px] px-5 lg:px-8">
                <div className="text-center mb-12">
                    <span className="font-heading text-primary text-xs uppercase tracking-[4px]">Калькулятор</span>
                    <h2 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-white uppercase tracking-wide mt-2">
                        Визнач свій <span className="text-gradient-red">ІМТ</span>
                    </h2>
                    <p className="font-body text-white/40 mt-3 max-w-md mx-auto text-sm">
                        ІМТ допомагає визначити, чи знаходиться ваша вага в межах норми.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-[50px] items-start">
                    
                    {/* --- ТАБЛИЦЯ --- */}
                    <div className="rounded-card border border-white/[0.06] bg-white/[0.02] p-[30px]">
                        <table className="w-full border-collapse mb-4">
                            <thead>
                                <tr>
                                    <th className="bg-primary/20 text-primary p-3 text-left uppercase text-[0.8rem] font-heading font-semibold tracking-wider rounded-tl-btn">ІМТ</th>
                                    <th className="bg-primary/20 text-primary p-3 text-left uppercase text-[0.8rem] font-heading font-semibold tracking-wider rounded-tr-btn">Ваговий статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={getRowClass('underweight')}>
                                    <td className={getCell1Class('underweight')}>Нижче 18.5</td>
                                    <td className={getCell2Class('underweight')}>Недостатня вага</td>
                                </tr>
                                <tr className={getRowClass('normal')}>
                                    <td className={getCell1Class('normal')}>18.5 – 24.9</td>
                                    <td className={getCell2Class('normal')}>Нормальна вага</td>
                                </tr>
                                <tr className={getRowClass('overweight')}>
                                    <td className={getCell1Class('overweight')}>25.0 – 29.9</td>
                                    <td className={getCell2Class('overweight')}>Зайва вага</td>
                                </tr>
                                <tr className={getRowClass('obese')}>
                                    <td className={getCell1Class('obese')}>30.0 і вище</td>
                                    <td className={getCell2Class('obese')}>Ожиріння</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-[0.85rem] text-white/30 font-medium pl-2 italic">*ІМТ: Індекс маси тіла</p>
                    </div>

                    {/* --- ФОРМА --- */}
                    <div className="py-2 lg:py-5">
                        <form onSubmit={calculateBMI}>
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 sm:mb-5">
                                <input 
                                    className="flex-1 w-full p-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-btn outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder-white/30 font-body"
                                    type="number" placeholder="Зріст / см" required min="100" max="250"
                                    value={height} onChange={e => setHeight(e.target.value)}
                                />
                                <input 
                                    className="flex-1 w-full p-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-btn outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder-white/30 font-body"
                                    type="number" placeholder="Вага / кг" required min="30" max="250"
                                    value={weight} onChange={e => setWeight(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 sm:mb-5">
                                <input 
                                    className="flex-1 w-full p-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-btn outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder-white/30 font-body"
                                    type="number" placeholder="Вік" required min="16" max="99"
                                    value={age} onChange={e => setAge(e.target.value)}
                                />
                                <select 
                                    className="flex-1 w-full p-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-btn outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 invalid:text-white/30 font-body"
                                    required value={gender} onChange={e => setGender(e.target.value)}
                                >
                                    <option value="" disabled>Стать</option>
                                    <option value="male">Чоловік</option>
                                    <option value="female">Жінка</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <select 
                                    className="w-full p-3.5 bg-white/[0.04] border border-white/[0.08] text-white rounded-btn outline-none transition-all duration-300 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 invalid:text-white/30 font-body"
                                    required value={activity} onChange={e => setActivity(e.target.value)}
                                >
                                    <option value="" disabled>Оберіть фіз. активність</option>
                                    <option value="sedentary">Мінімальна (Сидячий спосіб)</option>
                                    <option value="light">Легка (1-3 р/тиждень)</option>
                                    <option value="moderate">Помірна (3-5 р/тиждень)</option>
                                    <option value="active">Висока (6-7 р/тиждень)</option>
                                    <option value="extreme">Екстремальна (Щоденно)</option>
                                </select>
                            </div>

                            {/* Блок результату */}
                            <div className={`flex items-center justify-center text-center font-bold p-4 rounded-md min-h-[55px] mb-6 border bg-[#111] tracking-wide transition-colors duration-300 ${
                                !result ? 'border-[#333] text-[#888]' :
                                result.status === 'normal' ? 'border-[#0aa84b] text-[#0aa84b]' :
                                result.status === 'overweight' ? 'border-[#ff9900] text-[#ff9900]' :
                                'border-primary text-primary'
                            }`}>
                                {result ? (
                                    <span>Ваш ІМТ: {result.bmi}</span>
                                ) : (
                                    <span>Введіть дані для розрахунку</span>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-primary hover:bg-[#cc0000] text-white py-4 px-6 rounded-md font-black uppercase tracking-[1px] transition-all duration-300 shadow-[0_4px_15px_rgba(230,0,0,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(230,0,0,0.5)]"
                            >
                                ОБЧИСЛИТИ
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}