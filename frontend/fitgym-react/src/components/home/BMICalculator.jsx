// src/components/BMICalculator.jsx
import { useState } from 'react';

export default function BMICalculator() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [activity, setActivity] = useState('');
    
    const [result, setResult] = useState(null); // { bmi: 22.5, status: 'normal' }

    const calculateBMI = (e) => {
        e.preventDefault();
        
        if (!height || !weight) return;

        // Формула: вага (кг) / (зріст (м) * зріст (м))
        const h = parseFloat(height) / 100; // переводимо см в метри
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

    return (
        <section id="calculator" className="section container">
            <h2 className="section-title">Визнач свій індекс маси тіла (ІМТ)</h2>
            <p className="section-subtitle">ІМТ допомагає визначити, чи знаходиться ваша вага в межах норми. Введіть свої дані та отримайте результат.</p>

            <div className="imt-wrapper">
                {/* --- ТАБЛИЦЯ --- */}
                <div className="imt-table-container">
                    <table className="imt-table">
                        <thead>
                            <tr>
                                <th>ІМТ</th>
                                <th>ВАГОВИЙ СТАТУС</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={result?.status === 'underweight' ? 'active' : ''}>
                                <td>Нижче 18.5</td>
                                <td>Недостатня вага</td>
                            </tr>
                            <tr className={result?.status === 'normal' ? 'active' : ''}>
                                <td>18.5 – 24.9</td>
                                <td>Нормальна вага</td>
                            </tr>
                            <tr className={result?.status === 'overweight' ? 'active' : ''}>
                                <td>25.0 – 29.9</td>
                                <td>Зайва вага</td>
                            </tr>
                            <tr className={result?.status === 'obese' ? 'active' : ''}>
                                <td>30.0 і вище</td>
                                <td>Ожиріння</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="imt-note">*ІМТ: Індекс маси тіла</p>
                </div>

                {/* --- ФОРМА --- */}
                <div className="imt-form-container">
                    <form className="imt-form" onSubmit={calculateBMI}>
                        <div className="form-row">
                            <input 
                                type="number" placeholder="Зріст / см" required min="100" max="250"
                                value={height} onChange={e => setHeight(e.target.value)}
                            />
                            <input 
                                type="number" placeholder="Вага / кг" required min="30" max="250"
                                value={weight} onChange={e => setWeight(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <input 
                                type="number" placeholder="Вік" required min="16" max="99"
                                value={age} onChange={e => setAge(e.target.value)}
                            />
                            <select required value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="" disabled>Стать</option>
                                <option value="male">Чоловік</option>
                                <option value="female">Жінка</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <select required value={activity} onChange={e => setActivity(e.target.value)}>
                                <option value="" disabled>Оберіть фіз. активність</option>
                                <option value="sedentary">Мінімальна (Сидячий спосіб)</option>
                                <option value="light">Легка (1-3 р/тиждень)</option>
                                <option value="moderate">Помірна (3-5 р/тиждень)</option>
                                <option value="active">Висока (6-7 р/тиждень)</option>
                                <option value="extreme">Екстремальна (Щоденно)</option>
                            </select>
                        </div>

                        {/* Блок результату */}
                        <div className={`imt-result-box ${result ? result.status : ''}`}>
                            {result ? (
                                <span>Ваш ІМТ: {result.bmi}</span>
                            ) : (
                                <span>Введіть дані для розрахунку</span>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary imt-submit-btn" style={{width: '100%'}}>
                            ОБЧИСЛИТИ
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}