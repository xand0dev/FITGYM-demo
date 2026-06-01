import { Activity, TrendingDown, TrendingUp, Target, Scale, Heart, Percent } from "lucide-react";

export default function Biometrics({
    weight, setWeight,
    height, setHeight,
    goal, setGoal,
    bmi, progressToGoal
}) {
    const metrics = [
        { icon: Scale, label: "Поточна вага", value: `${weight} кг`, trend: "Поточна", trendIcon: TrendingDown, positive: true },
        { icon: Heart, label: "BMI", value: bmi, trend: "Поточний", trendIcon: TrendingUp, positive: true },
        { icon: Percent, label: "Відсоток жиру", value: "18.3%", trend: "Орієнтовний", trendIcon: TrendingDown, positive: true },
        { icon: Target, label: "Прогрес до цілі", value: `${progressToGoal}%`, trend: "На шляху", trendIcon: TrendingUp, positive: true },
    ];

    const history = [
        { date: "01.01.2024", weight: "85.0 кг", bmi: "25.2", fat: "20.1%" },
        { date: "01.02.2024", weight: "84.2 кг", bmi: "24.9", fat: "19.5%" },
        { date: "01.03.2024", weight: "83.5 кг", bmi: "24.7", fat: "19.0%" },
        { date: "01.04.2024", weight: "82.5 кг", bmi: "24.1", fat: "18.3%" },
    ];

    return (
        <div className="space-y-6 animate-fade-in text-[var(--c-text)]">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary" />
                    <span className="text-primary">Біометрія</span>
                </h2>
                <p className="text-[#888] text-sm mt-1 font-bold">
                    Відстежуйте ваш фізичний прогрес
                </p>
            </div>

            {/* Existing Sliders adapted to new UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px] mb-[20px]">
                <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-colors duration-300">
                    <label className="block text-[0.75rem] font-black uppercase tracking-wider text-[#888] mb-2">ВАГА (КГ)</label>
                    <div className="text-[2.5rem] font-black">{weight}</div>
                    <input type="range" min="40" max="150" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full cursor-pointer accent-primary" />
                </div>
                <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-colors duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <label className="block text-[0.75rem] font-black uppercase tracking-wider text-[#888] mb-2">ЦІЛЬ (КГ)</label>
                            <input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-[100px] text-[2.5rem] font-black bg-transparent border-none outline-none text-[var(--c-text)]" />
                        </div>
                        <div className="flex flex-col items-end">
                            <label className="block text-[0.75rem] font-black uppercase tracking-wider text-[#888] mb-2 text-right">ЗРІСТ (CM)</label>
                            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-[80px] text-center font-black p-2.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] outline-none transition-colors duration-300 focus:border-primary focus:shadow-[0_0_10px_rgba(255,0,0,0.2)]" />
                        </div>
                    </div>
                    <div className="h-[8px] mt-[15px] bg-[var(--c-input)] border border-[var(--c-border)] rounded-[10px] overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_10px_#ff0000] transition-all duration-500" style={{ width: `${progressToGoal}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div key={m.label} className="p-5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] text-center transition-transform hover:-translate-y-1 duration-300">
                        <m.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-xs text-[#888] uppercase tracking-wider font-extrabold mb-2">{m.label}</p>
                        <p className="text-2xl font-black">{m.value}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <m.trendIcon className={`w-3 h-3 ${m.positive ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={`text-xs font-bold ${m.positive ? 'text-green-500' : 'text-red-500'}`}>{m.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <h3 className="text-lg font-black uppercase tracking-wider mb-4">Історія вимірювань</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--c-border)]">
                                <th className="text-left py-3 px-4 text-xs text-[#888] uppercase tracking-wider font-extrabold">Дата</th>
                                <th className="text-left py-3 px-4 text-xs text-[#888] uppercase tracking-wider font-extrabold">Вага</th>
                                <th className="text-left py-3 px-4 text-xs text-[#888] uppercase tracking-wider font-extrabold">BMI</th>
                                <th className="text-left py-3 px-4 text-xs text-[#888] uppercase tracking-wider font-extrabold">Жир</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.date} className="border-b border-[var(--c-border)] last:border-0 hover:bg-[var(--c-input)] transition-colors">
                                    <td className="py-3 px-4 text-[#888] font-bold">{h.date}</td>
                                    <td className="py-3 px-4 font-black">{h.weight}</td>
                                    <td className="py-3 px-4 font-black">{h.bmi}</td>
                                    <td className="py-3 px-4 font-black">{h.fat}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}