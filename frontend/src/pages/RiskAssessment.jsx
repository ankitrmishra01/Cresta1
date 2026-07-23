import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ArrowLeft,
    Loader2,
    Clock,
    Wallet,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE, apiCall } from '../api';

// Decomposed sub-components and data
import { questions, profiles } from '../components/risk/riskData';
import QuizStep from '../components/risk/QuizStep';
import ResultsPanel from '../components/risk/ResultsPanel';

const RiskAssessment = () => {
    const { t } = useTranslation();
    const { completeRiskAssessment } = useUser();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const TOTAL_STEPS = questions.length + 2; // Questions + Profile Details + Results
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [age, setAge] = useState('');
    const [income, setIncome] = useState('');
    const [goal, setGoal] = useState('Wealth');
    const [showResult, setShowResult] = useState(false);
    const [riskProfile, setRiskProfile] = useState(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    // Calculate dynamic "Draft Allocation" preview
    const draftAllocation = useMemo(() => {
        const scoresArr = Object.values(answers);
        if (scoresArr.length === 0) return profiles.balanced.allocation;

        const avgScore = scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length;
        if (avgScore <= 1.5) return profiles.conservative.allocation;
        if (avgScore >= 3.0) return profiles.aggressive.allocation;
        return profiles.balanced.allocation;
    }, [answers]);

    const handleOptionSelect = (score) => {
        setAnswers({ ...answers, [step]: score });
        // Auto-advance for better UX on questions
        setTimeout(() => {
            if (step < questions.length - 1) setStep(step + 1);
        }, 300);
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS - 2) {
            setStep(step + 1);
        } else {
            calculateResult();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const calculateResult = async () => {
        const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
        let profile = profiles.balanced;
        let riskValue = 3;

        // Mapping 8-32 score to 1-5 Risk Tolerance for AI
        if (totalScore <= 12) { profile = profiles.conservative; riskValue = 1; }
        else if (totalScore <= 18) { profile = profiles.conservative; riskValue = 2; }
        else if (totalScore <= 24) { profile = profiles.balanced; riskValue = 3; }
        else if (totalScore <= 28) { profile = profiles.aggressive; riskValue = 4; }
        else { profile = profiles.aggressive; riskValue = 5; }

        setRiskProfile(profile);
        setShowResult(true);
        completeRiskAssessment();
        setIsLoadingAI(false);

        // Run profile save and AI recommendations in background non-blocking
        (async () => {
            try {
                const profilePayload = {
                    risk_score: totalScore,
                    risk_profile: profile.name,
                    investment_goal: goal,
                    age: parseInt(age) || 25,
                    income: parseInt(income) || 700000
                };

                await apiCall('/profile/save/', {
                    method: 'POST',
                    body: JSON.stringify(profilePayload)
                });

                const recommendPayload = {
                    Age: parseInt(age) || 25,
                    Income: parseInt(income) || 700000,
                    Risk_Tolerance: riskValue,
                    Investment_Goal: goal
                };
                const res = await apiCall('/recommend/', {
                    method: 'POST',
                    body: JSON.stringify(recommendPayload)
                });
                const data = await res.json();
                if (data.Recommended_Stocks) {
                    localStorage.setItem('ai_insights_data', JSON.stringify(data));
                }
            } catch (e) {
                console.error("Risk Assessment Persistence/AI Error", e);
            }
        })();
    };


    const currentQuestion = questions[step];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <div className="grid lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
                            {/* Left: Questionnaire (7 cols) */}
                            <motion.div
                                key={`content-${step}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="lg:col-span-7 space-y-8"
                            >
                                <div>
                                    <h1 className={`text-4xl font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {step < questions.length ? "Risk Assessment" : "Investor Profile"}
                                    </h1>
                                    <p className={`mt-2 text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                        Step {step + 1} of {questions.length + 1}
                                    </p>
                                </div>

                                {step < questions.length ? (
                                    <QuizStep
                                        question={currentQuestion}
                                        step={step}
                                        answers={answers}
                                        onOptionSelect={handleOptionSelect}
                                    />
                                ) : (
                                    <div className="space-y-8 ml-12">
                                        <h2 className={`text-2xl font-bold italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            "Investing is more about temperament than intellect."
                                        </h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Current Age</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                    <input
                                                        type="number"
                                                        placeholder="Your Age"
                                                        value={age}
                                                        onChange={e => setAge(e.target.value)}
                                                        className={`w-full rounded pl-12 pr-6 py-4 text-lg transition-all font-bold bento-input ${isDark ? 'bg-[#111111] border-[#222222] focus:border-white text-white' : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Annual Income (₹)</label>
                                                <div className="relative">
                                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                                    <input
                                                        type="number"
                                                        placeholder="Annual Income"
                                                        value={income}
                                                        onChange={e => setIncome(e.target.value)}
                                                        className={`w-full rounded pl-12 pr-6 py-4 text-lg transition-all font-bold bento-input ${isDark ? 'bg-[#111111] border-[#222222] focus:border-white text-white' : 'bg-white border-slate-300 focus:border-emerald-500 text-slate-900'}`}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Primary Investment Objective</label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {['Wealth', 'Tax', 'Income'].map((g) => (
                                                        <button
                                                            key={g}
                                                            onClick={() => setGoal(g)}
                                                            className={`py-4 rounded border font-bold transition-all
                                                                ${goal === g ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : (isDark ? 'border-[#222222] hover:bg-[#111111] text-gray-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')}`}
                                                        >
                                                            {g} Generation
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-10 ml-12 flex justify-between items-center">
                                    <button
                                        onClick={handleBack}
                                        disabled={step === 0}
                                        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 disabled:opacity-30 font-bold px-4 py-2"
                                    >
                                        <ArrowLeft size={18} /> Prev Step
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={(step < questions.length && !answers[step]) || (step === questions.length && (!age || !income))}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-extrabold shadow-xl shadow-emerald-600/20 flex items-center gap-2 group transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        {step === questions.length ? (isLoadingAI ? "Mapping AI Neural..." : "Unlock My Strategy") : "Continue Phase"}
                                        {isLoadingAI ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Right: Preview Engine (5 cols) */}
                            <div className="lg:col-span-5 h-[500px] flex flex-col justify-center sticky top-24">
                            <div className={`bento-panel border p-8 rounded relative overflow-hidden ${isDark ? 'border-[#222222] bg-[#0A0A0A]' : 'border-slate-200 bg-white shadow-sm'}`}>
                                    <div className="absolute top-4 right-8 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60">Live Engine Analysis</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="w-64 h-64 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={draftAllocation}
                                                        cx="50%" cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={100}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {draftAllocation.map((entry, idx) => (
                                                            <Cell key={idx} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Draft Profile</span>
                                                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {Object.keys(answers).length > 0 ? "Analyzing" : "Awaiting"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full mt-8 space-y-3">
                                            <div className="flex justify-between items-center px-4">
                                            <span className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>System Accuracy</span>
                                                <span className="text-xs font-bold text-emerald-500">{Math.min(20 + step * 10, 98)}%</span>
                                            </div>
                                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#222222]' : 'bg-slate-200'}`}>
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(20 + step * 10, 98)}%` }}
                                                />
                                            </div>
                                            <p className={`text-[10px] text-center leading-relaxed pt-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                                                Current data points collected: {Object.keys(answers).length} of 8. <br />
                                                Neural network status: Optimization Active.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ResultsPanel
                            riskProfile={riskProfile}
                            goal={goal}
                            isLoadingAI={isLoadingAI}
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default RiskAssessment;
