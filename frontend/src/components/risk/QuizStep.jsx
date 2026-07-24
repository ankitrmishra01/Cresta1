import React from 'react';
import { Info, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Renders a single quiz question with selectable option buttons.
 */
const QuizStep = ({ question, step, answers, onOptionSelect }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className={`text-2xl font-bold flex items-start gap-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-sm shrink-0 mt-1">
                        {step + 1}
                    </span>
                    {question.question}
                </h2>
                <p className={`ml-12 text-sm italic flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    <Info className="w-3 h-3" /> {question.description}
                </p>
            </div>

            <div className="grid gap-4 ml-12">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onOptionSelect(option.score)}
                        className={`group p-5 rounded border text-left transition-all duration-300 relative overflow-hidden
                            ${answers[step] === option.score
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : (isDark ? 'border-[#222222] hover:bg-[#111111] bg-[#0A0A0A]' : 'border-slate-200 hover:bg-slate-50 bg-white')}`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <span className={`font-semibold text-lg ${answers[step] === option.score ? 'text-emerald-400' : (isDark ? 'text-gray-300' : 'text-slate-700')}`}>
                                {option.text}
                            </span>
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                                ${answers[step] === option.score ? 'border-emerald-500 bg-emerald-500 text-white' : (isDark ? 'border-[#222222]' : 'border-slate-300')}`}>
                                {answers[step] === option.score && <Check className="w-4 h-4" />}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuizStep;
