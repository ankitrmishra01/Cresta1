import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';



const RiskAssessment = () => {
    const { t } = useTranslation();

    const questions = [
        {
            id: 1,
            question: t('risk_q1'),
            options: [
                { text: t('risk_q1_o1'), score: 1 },
                { text: t('risk_q1_o2'), score: 2 },
                { text: t('risk_q1_o3'), score: 3 },
                { text: t('risk_q1_o4'), score: 4 }
            ]
        },
        {
            id: 2,
            question: t('risk_q2'),
            options: [
                { text: t('risk_q2_o1'), score: 1 },
                { text: t('risk_q2_o2'), score: 2 },
                { text: t('risk_q2_o3'), score: 3 },
                { text: t('risk_q2_o4'), score: 4 }
            ]
        },
        {
            id: 3,
            question: t('risk_q3'),
            options: [
                { text: t('risk_q3_o1'), score: 1 },
                { text: t('risk_q3_o2'), score: 2 },
                { text: t('risk_q3_o3'), score: 3 },
                { text: t('risk_q3_o4'), score: 4 }
            ]
        },
        {
            id: 4,
            question: t('risk_q4'),
            options: [
                { text: t('risk_q4_o1'), score: 1 },
                { text: t('risk_q4_o2'), score: 2 },
                { text: t('risk_q4_o3'), score: 3 },
                { text: t('risk_q4_o4'), score: 4 }
            ]
        }
    ];

    const profiles = {
        conservative: {
            label: t('profile_conservative'),
            description: t('profile_conservative_desc'),
            allocation: [
                { name: 'Govt Bonds', value: 60, color: '#10B981' },
                { name: 'Corporate Debt', value: 20, color: '#3B82F6' },
                { name: 'Large Cap Stocks', value: 15, color: '#F59E0B' },
                { name: 'Gold', value: 5, color: '#FCD34D' }
            ]
        },
        balanced: {
            label: t('profile_balanced'),
            description: t('profile_balanced_desc'),
            allocation: [
                { name: 'Large Cap Stocks', value: 40, color: '#3B82F6' },
                { name: 'Mid Cap Stocks', value: 20, color: '#8B5CF6' },
                { name: 'Bonds', value: 30, color: '#10B981' },
                { name: 'Gold', value: 10, color: '#FCD34D' }
            ]
        },
        aggressive: {
            label: t('profile_aggressive'),
            description: t('profile_aggressive_desc'),
            allocation: [
                { name: 'Small Cap Stocks', value: 30, color: '#EC4899' },
                { name: 'Mid Cap Stocks', value: 30, color: '#8B5CF6' },
                { name: 'Large Cap Stocks', value: 30, color: '#3B82F6' },
                { name: 'Crypto/Alt', value: 10, color: '#06B6D4' }
            ]
        }
    };
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [riskProfile, setRiskProfile] = useState(null);

    const handleOptionSelect = (score) => {
        setAnswers({ ...answers, [step]: score });
    };

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            calculateResult();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const calculateResult = () => {
        const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
        let profile = profiles.balanced;

        if (totalScore <= 6) profile = profiles.conservative;
        else if (totalScore >= 12) profile = profiles.aggressive;

        setRiskProfile(profile);
        setShowResult(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {showResult ? t('investment_profile') : t('risk_assessment')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {showResult
                            ? t('profile_subtitle')
                            : t('risk_subtitle')}
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl bg-white/50 dark:bg-fintech-card/50 backdrop-blur-xl min-h-[500px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key="questionnaire"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-lg mx-auto"
                            >
                                <div className="mb-8">
                                    <div className="flex justify-betweentext-sm text-gray-400 mb-2">
                                        <span>{t('question_progress', { current: step + 1, total: questions.length })}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full">
                                        <div
                                            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                                    {questions[step].question}
                                </h2>

                                <div className="space-y-4">
                                    {questions[step].options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionSelect(option.score)}
                                            className={`w-full p-4 rounded-xl text-left border transition-all duration-200 flex justify-between items-center group
                                                ${answers[step] === option.score
                                                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-neon-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                                    : 'border-gray-200 dark:border-white/10 hover:border-cyan-500/50 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <span className="font-medium">{option.text}</span>
                                            {answers[step] === option.score && <CheckCircle className="w-5 h-5 text-cyan-500" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-10 flex justify-between">
                                    <button
                                        onClick={handleBack}
                                        disabled={step === 0}
                                        className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                                            ${step === 0
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <ArrowLeft className="w-4 h-4" /> {t('back')}
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!answers[step]}
                                        className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg
                                            ${!answers[step]
                                                ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/25 transform hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {step === questions.length - 1 ? t('see_results') : t('next')} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full"
                            >
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="flex flex-col items-center justify-center relative">
                                        <div className="w-[300px] h-[300px] relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={riskProfile.allocation}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {riskProfile.allocation.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Profile</span>
                                                <span className="text-xl font-bold text-gray-900 dark:text-white">{riskProfile.label}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-cyan-600 dark:text-neon-cyan mb-2">
                                                {riskProfile.label} Investor
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {riskProfile.description}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-500/30 flex gap-3">
                                            <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">{t('ai_recommendation')}</h4>
                                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                    {t('recommendation_desc')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{t('recommended_allocation')}</h4>
                                            {riskProfile.allocation.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                                    </div>
                                                    <span className="font-mono font-bold">{item.value}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => window.location.reload()}
                                            className="w-full mt-4 glass-btn py-3 rounded-xl font-semibold text-cyan-900 dark:text-white"
                                        >
                                            {t('retake_assessment')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RiskAssessment;
