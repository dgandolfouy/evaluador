import React from 'react';
import { SavedEvaluation, Employee } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Target, Award, PieChart as PieIcon, Activity } from 'lucide-react';

interface StatsViewProps {
    evaluations: SavedEvaluation[];
    employees: Employee[];
    onClose: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ evaluations, employees, onClose }) => {
    // 1. Global Metrics
    const totalEvaluations = evaluations.length;
    const avgScore = totalEvaluations > 0
        ? (evaluations.reduce((acc, ev) => acc + (ev.finalscore || ev.finalScore || 0), 0) / totalEvaluations).toFixed(1)
        : '0.0';

    // 2. Data for Radar Chart (Categories)
    const categoryScores: Record<string, { total: number, count: number }> = {};
    evaluations.forEach(ev => {
        (ev.criteria || []).forEach(c => {
            if (!categoryScores[c.category]) categoryScores[c.category] = { total: 0, count: 0 };
            categoryScores[c.category].total += c.score;
            categoryScores[c.category].count += 1;
        });
    });

    const radarData = Object.keys(categoryScores).map(cat => ({
        subject: cat,
        A: (categoryScores[cat].total / categoryScores[cat].count).toFixed(1),
        fullMark: 10
    }));

    // 3. Data for Bar Chart (Departments)
    const deptPerformance: Record<string, { total: number, count: number }> = {};
    evaluations.forEach(ev => {
        const emp = employees.find(e => e.id === (ev.employeeid || ev.employeeId));
        if (emp) {
            const dept = emp.department;
            if (!deptPerformance[dept]) deptPerformance[dept] = { total: 0, count: 0 };
            deptPerformance[dept].total += (ev.finalscore || ev.finalScore || 0);
            deptPerformance[dept].count += 1;
        }
    });

    const barData = Object.keys(deptPerformance).map(dept => ({
        name: dept,
        score: parseFloat((deptPerformance[dept].total / deptPerformance[dept].count).toFixed(1))
    })).sort((a, b) => b.score - a.score);

    // 4. Compliance Distribution
    const dist = { high: 0, mid: 0, low: 0 };
    evaluations.forEach(ev => {
        const s = (ev.finalscore || ev.finalScore || 0);
        if (s >= 8) dist.high++;
        else if (s >= 5) dist.mid++;
        else dist.low++;
    });

    const pieData = [
        { name: 'Excelente (8-10)', value: dist.high, color: '#f97316' }, // orange-500
        { name: 'Aceptable (5-7)', value: dist.mid, color: '#eab308' },  // yellow-500
        { name: 'Crítico (0-4)', value: dist.low, color: '#ef4444' }    // red-500
    ].filter(d => d.value > 0);

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Activity className="text-orange-500" /> Analítica de Competencia
                </h2>
                <button onClick={onClose} className="text-xs font-black uppercase text-slate-500 hover:text-white transition-all">
                    Cerrar Panel
                </button>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <TrendingUp className="text-orange-500 mb-4" size={24} />
                    <p className="text-3xl font-black text-white">{avgScore}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score Promedio Lote</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <Users className="text-blue-500 mb-4" size={24} />
                    <p className="text-3xl font-black text-white">{totalEvaluations}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Evaluaciones</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <Target className="text-emerald-500 mb-4" size={24} />
                    <p className="text-3xl font-black text-white">{dist.high}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Excelencia (+8)</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <Award className="text-amber-500 mb-4" size={24} />
                    <p className="text-3xl font-black text-white">ISO 9001</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marco Normativo Activo</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart: Category Compliance */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <PieIcon size={16} className="text-orange-500" /> Perfil Competencial Global
                    </h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="300" minWidth={0}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#f97316"
                                    fill="#f97316"
                                    fillOpacity={0.6}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Performance by Department */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl h-[450px] flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500" /> Desempeño por Área
                    </h3>
                    <div className="flex-1 w-full h-80 min-h-[300px]">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" domain={[0, 10]} hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.score >= 8 ? '#10b981' : entry.score >= 5 ? '#eab308' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Distribution Summary */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Distribución de Competencias</h3>
                <div className="space-y-6">
                    {pieData.map((d, i) => {
                        const pct = Math.round((d.value / totalEvaluations) * 100);
                        return (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span style={{ color: d.color }}>{d.name}</span>
                                    <span className="text-white">{d.value} ({pct}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: d.color }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
