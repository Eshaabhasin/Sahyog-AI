import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './Finance.css';

function PlanningTools({ onBack }) {
    const [income, setIncome] = useState('');
    const [budgetItems, setBudgetItems] = useState([
        { category: 'Food & Groceries', amount: 0, percentage: 0 },
        { category: 'Housing & Rent', amount: 0, percentage: 0 },
        { category: 'Transportation', amount: 0, percentage: 0 },
        { category: 'Healthcare', amount: 0, percentage: 0 },
        { category: 'Education', amount: 0, percentage: 0 },
        { category: 'Savings', amount: 0, percentage: 0 },
        { category: 'Entertainment', amount: 0, percentage: 0 },
        { category: 'Others', amount: 0, percentage: 0 }
    ]);
    const [language, setLanguage] = useState('English');
    const [budgetAdvice, setBudgetAdvice] = useState('');
    const [loading, setLoading] = useState(false);

    const languages = ['English', 'Hindi', 'Punjabi', 'Marathi', 'Telugu', 'Tamil'];
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

    const handleIncomeChange = (value) => {
        setIncome(value);
        if (value) {
            // Auto-suggest budget allocation percentages
            const suggestions = [
                { category: 'Food & Groceries', percentage: 25 },
                { category: 'Housing & Rent', percentage: 30 },
                { category: 'Transportation', percentage: 10 },
                { category: 'Healthcare', percentage: 5 },
                { category: 'Education', percentage: 5 },
                { category: 'Savings', percentage: 15 },
                { category: 'Entertainment', percentage: 5 },
                { category: 'Others', percentage: 5 }
            ];
            
            const updatedItems = budgetItems.map(item => {
                const suggestion = suggestions.find(s => s.category === item.category);
                const amount = suggestion ? (value * suggestion.percentage / 100) : 0;
                return {
                    ...item,
                    amount: Math.round(amount),
                    percentage: suggestion ? suggestion.percentage : 0
                };
            });
            setBudgetItems(updatedItems);
        }
    };

    const handleAmountChange = (index, amount) => {
        const updatedItems = [...budgetItems];
        updatedItems[index].amount = parseFloat(amount) || 0;
        updatedItems[index].percentage = income ? Math.round((updatedItems[index].amount / income) * 100) : 0;
        setBudgetItems(updatedItems);
    };

    const getTotalAllocated = () => {
        return budgetItems.reduce((sum, item) => sum + item.amount, 0);
    };

    const getRemainingAmount = () => {
        return income - getTotalAllocated();
    };

    const getChartData = () => {
        return budgetItems.filter(item => item.amount > 0).map(item => ({
            name: item.category,
            value: item.amount,
            percentage: item.percentage
        }));
    };

    const getBudgetAdvice = async () => {
        if (!income || getTotalAllocated() === 0) return;

        setLoading(true);
        try {
            const budgetData = {
                income: income,
                allocations: budgetItems.filter(item => item.amount > 0),
                totalAllocated: getTotalAllocated(),
                remaining: getRemainingAmount()
            };

            const response = await fetch('http://localhost:5001/api/finance/planning-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    toolType: 'Budget Analysis', 
                    budgetData: budgetData,
                    language 
                })
            });

            const data = await response.json();
            if (data.success) {
                setBudgetAdvice(data.calculation);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="finance-container">
            <div className="finance-header">
                <button onClick={onBack} className="back-button">← Back</button>
                <h1>Budget Calculator</h1>
            </div>

            <div className="budget-form">
                <div className="income-section">
                    <div className="form-group">
                        <label>Monthly Income (₹):</label>
                        <input
                            type="number"
                            value={income}
                            onChange={(e) => handleIncomeChange(e.target.value)}
                            placeholder="Enter your monthly income"
                            className="income-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Language:</label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="budget-allocation">
                    <h3>Budget Allocation</h3>
                    <div className="budget-items">
                        {budgetItems.map((item, index) => (
                            <div key={index} className="budget-item">
                                <label>{item.category}:</label>
                                <div className="amount-input-group">
                                    <input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handleAmountChange(index, e.target.value)}
                                        placeholder="0"
                                        className="budget-amount-input"
                                    />
                                    <span className="percentage">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="budget-summary">
                        <div className="summary-item">
                            <span>Total Income: ₹{income || 0}</span>
                        </div>
                        <div className="summary-item">
                            <span>Total Allocated: ₹{getTotalAllocated()}</span>
                        </div>
                        <div className={`summary-item ${getRemainingAmount() < 0 ? 'negative' : 'positive'}`}>
                            <span>Remaining: ₹{getRemainingAmount()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={getBudgetAdvice} 
                        disabled={loading || !income || getTotalAllocated() === 0} 
                        className="analyze-btn"
                    >
                        {loading ? 'Analyzing...' : 'Get Budget Analysis'}
                    </button>
                </div>
            </div>

            {getChartData().length > 0 && (
                <div className="charts-section">
                    <div className="chart-container">
                        <h3>Budget Distribution (Pie Chart)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getChartData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {getChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h3>Budget Breakdown (Bar Chart)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis />
                                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {budgetAdvice && (
                <div className="guidance-result">
                    <div className="result-header">
                        <h3>Budget Analysis & Advice</h3>
                        <button onClick={() => speakText(budgetAdvice)} className="audio-btn">
                            🔊 Listen
                        </button>
                    </div>
                    <div className="guidance-content">
                        {budgetAdvice.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlanningTools;