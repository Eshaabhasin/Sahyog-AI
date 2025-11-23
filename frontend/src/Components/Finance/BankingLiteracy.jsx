import React, { useState } from 'react';
import './Finance.css';

function BankingLiteracy({ onBack }) {
    const [topic, setTopic] = useState('');
    const [language, setLanguage] = useState('English');
    const [guidance, setGuidance] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const topics = [
        'Bank Account Opening',
        'UPI Setup and Usage',
        'ATM Usage Guide',
        'Mobile Banking Tutorial',
        'Debit Card Safety',
        'Online Banking Security',
        'Digital Wallet Setup',
        'KYC Documents Guide'
    ];

    const languages = ['English', 'Hindi', 'Punjabi', 'Marathi', 'Telugu', 'Tamil'];

    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';

            setIsListening(true);
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setTopic(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/finance/banking-literacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, language })
            });

            const data = await response.json();
            if (data.success) {
                setGuidance(data.guidance);
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
                <h1>Banking & Digital Literacy</h1>
            </div>

            <form onSubmit={handleSubmit} className="finance-form">
                <div className="form-group">
                    <label>Select Topic or Ask Your Question:</label>
                    <div className="topic-buttons">
                        {topics.map((t, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`topic-btn ${topic === t ? 'active' : ''}`}
                                onClick={() => setTopic(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Type your banking question or select from above..."
                        className="topic-input"
                    />
                    <button
                        type="button"
                        onClick={startListening}
                        className={`voice-btn ${isListening ? 'listening' : ''}`}
                        disabled={isListening}
                    >
                        🎤 {isListening ? 'Listening...' : 'Voice'}
                    </button>
                </div>

                <div className="form-group">
                    <label>Language:</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={loading || !topic.trim()} className="submit-btn">
                    {loading ? 'Getting Guidance...' : 'Get Banking Guidance'}
                </button>
            </form>

            {guidance && (
                <div className="guidance-result">
                    <div className="result-header">
                        <h3>Banking Guidance</h3>
                        <button onClick={() => speakText(guidance)} className="audio-btn">
                            🔊 Listen
                        </button>
                    </div>
                    <div className="guidance-content">
                        {guidance.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BankingLiteracy;