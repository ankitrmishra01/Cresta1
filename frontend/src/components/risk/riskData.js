import { Shield, Zap, TrendingUp } from 'lucide-react';

/**
 * Risk assessment quiz questions and risk profile definitions.
 * Extracted from RiskAssessment.jsx for cleaner separation of data and UI.
 */

export const questions = [
    {
        id: 1,
        question: "What is your primary investment goal?",
        description: "Knowing your 'Why' helps us determine the 'How'.",
        options: [
            { text: "Preserving Capital (Keep what I have safe)", score: 1 },
            { text: "Stable Income (Regular payouts)", score: 2 },
            { text: "Balanced Growth (Mix of safety and growth)", score: 3 },
            { text: "Maximizing Wealth (High growth focus)", score: 4 }
        ]
    },
    {
        id: 2,
        question: "How long do you plan to hold your investments?",
        description: "Time in the market beats timing the market.",
        options: [
            { text: "Less than 2 years (Short term)", score: 1 },
            { text: "2 to 5 years (Medium term)", score: 2 },
            { text: "5 to 10 years (Long term)", score: 3 },
            { text: "More than 10 years (Strategic)", score: 4 }
        ]
    },
    {
        id: 3,
        question: "If your portfolio dropped 10% in a month, how would you react?",
        description: "Your emotional reaction to loss defines your risk tolerance.",
        options: [
            { text: "Sell everything immediately to stop losses", score: 1 },
            { text: "Sell a portion to reduce exposure", score: 2 },
            { text: "Hold and wait for recovery", score: 3 },
            { text: "Buy more at a 'discounted' price", score: 4 }
        ]
    },
    {
        id: 4,
        question: "How would you describe your investment experience?",
        description: "Familiarity with market cycles reduces panic.",
        options: [
            { text: "Beginner (Just starting out)", score: 1 },
            { text: "Intermediate (I have some individual stocks)", score: 2 },
            { text: "Advanced (I understand technicals and macro)", score: 3 },
            { text: "Professional (Trading for years)", score: 4 }
        ]
    },
    {
        id: 5,
        question: "What is your annual income and stability?",
        description: "Steady income allows for higher risk-taking.",
        options: [
            { text: "Fixed/Retired (Need safety above all)", score: 1 },
            { text: "Moderate (Stable but limited surplus)", score: 2 },
            { text: "High (Good surplus after expenses)", score: 3 },
            { text: "Very High & Growing (Significant surplus)", score: 4 }
        ]
    },
    {
        id: 6,
        question: "How much of your savings are you investing now?",
        description: "Exposure management is key to survival.",
        options: [
            { text: "Less than 10% (Just testing the waters)", score: 1 },
            { text: "10% to 30% (Standard allocation)", score: 2 },
            { text: "30% to 60% (Serious wealth building)", score: 3 },
            { text: "More than 60% (High conviction)", score: 4 }
        ]
    },
    {
        id: 7,
        question: "Do you have dependable sources of financial backup?",
        description: "Safety nets provide the courage to stay invested.",
        options: [
            { text: "No, this is my primary savings pool", score: 1 },
            { text: "I have a small emergency fund", score: 2 },
            { text: "Yes, I have insurance and emergency funds", score: 3 },
            { text: "I have multiple assets and safety nets", score: 4 }
        ]
    },
    {
        id: 8,
        question: "What is your stance on inflation vs. market risk?",
        description: "Choosing between certain decay or potential volatility.",
        options: [
            { text: "I prefer 100% safety, even if I lose value to inflation", score: 1 },
            { text: "I want to beat inflation with minimal risk", score: 2 },
            { text: "I am okay with volatility to beat inflation significantly", score: 3 },
            { text: "I want maximum returns and can handle high volatility", score: 4 }
        ]
    }
];

export const profiles = {
    conservative: {
        id: 'conservative',
        label: "Conservative",
        icon: Shield,
        color: '#10B981',
        description: "You prioritize capital preservation over growth. Typically suited for long-term safety or short horizons.",
        allocation: [
            { name: 'Fixed Income', value: 60, color: '#10B981' },
            { name: 'Corporate Debt', value: 20, color: '#3B82F6' },
            { name: 'Blue Chips', value: 15, color: '#F59E0B' },
            { name: 'Cash/Gold', value: 5, color: '#FCD34D' }
        ]
    },
    balanced: {
        id: 'balanced',
        label: "Balanced",
        icon: Zap,
        color: '#F59E0B',
        description: "A moderate approach seeking reasonable growth while accepting moderate market fluctuations.",
        allocation: [
            { name: 'Large Cap', value: 40, color: '#3B82F6' },
            { name: 'Mid Cap', value: 20, color: '#8B5CF6' },
            { name: 'Debt/Bonds', value: 30, color: '#10B981' },
            { name: 'Gold/ETF', value: 10, color: '#FCD34D' }
        ]
    },
    aggressive: {
        id: 'aggressive',
        label: "Aggressive",
        icon: TrendingUp,
        color: '#EC4899',
        description: "You seek maximum wealth creation and are comfortable with high volatility and market dips.",
        allocation: [
            { name: 'Small Cap', value: 30, color: '#EC4899' },
            { name: 'Mid Cap', value: 30, color: '#8B5CF6' },
            { name: 'Large Cap', value: 30, color: '#3B82F6' },
            { name: 'Sector/Speculative', value: 10, color: '#10B981' }
        ]
    }
};
