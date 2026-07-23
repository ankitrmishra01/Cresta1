import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Displays the risk assessment results with profile classification,
 * strategy overview, allocation bars, and navigation to dashboard.
 */
const ResultsPanel = ({ riskProfile, goal, isLoadingAI }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl mx-auto py-12"
        >
            <div className="text-center mb-12">
                <span className="px-4 py-1.5 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-600/20">Analysis Complete</span>
                <h1 className="text-5xl font-black text-white mt-4 tracking-tight">Your Investor DNA</h1>
                <p className="text-gray-400 mt-2 text-xl">We've mapped your mindset to our core strategies.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 bento-panel bg-[#0A0A0A] p-12 rounded border border-[#222222] relative overflow-hidden shadow-sm">
                <div className="space-y-10 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`p-6 rounded-3xl bg-opacity-10`} style={{ backgroundColor: riskProfile.color }}>
                            <riskProfile.icon size={48} style={{ color: riskProfile.color }} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Primary Classification</h2>
                            <div className="text-4xl font-black" style={{ color: riskProfile.color }}>{riskProfile.label}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Strategy Overview</h3>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {riskProfile.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222]">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Risk Level</div>
                            <div className="font-bold text-white">Moderate-High</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222]">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Volatility Class</div>
                            <div className="font-bold text-white">II (Structural)</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    <div className="bento-panel bg-[#111111] rounded-[2rem] p-8 border border-[#222222] shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                            AI-Proposed Allocation
                            <span className="text-[10px] font-normal text-gray-400 italic">Optimized for {goal}</span>
                        </h3>
                        <div className="space-y-4">
                            {riskProfile.allocation.map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-400">{item.name}</span>
                                        <span className="text-white">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: item.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        disabled={isLoadingAI}
                        className="premium-button w-full bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl disabled:opacity-50"
                    >
                        {isLoadingAI ? "Finalizing AI Logic..." : "Go to Dashboard"}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultsPanel;
