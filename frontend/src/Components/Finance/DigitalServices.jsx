import React, { useState } from 'react';
import './Finance.css';

function DigitalServices({ onBack }) {
    const [service, setService] = useState('');
    const [language, setLanguage] = useState('English');
    const [guide, setGuide] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const services = [
        'PhonePe Setup & Usage',
        'Google Pay (GPay) Guide',
        'Paytm Wallet Setup',
        'QR Code Payments',
        'Online Bill Payments',
        'Money Transfer Guide',
        'Recharge & Bookings',
        'Digital Payment Security'
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
                setService(transcript);
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
        if (!service.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/finance/digital-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service, language })
            });

            const data = await response.json();
            if (data.success) {
                setGuide(data.guide);
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
                <h1>Digital Financial Services</h1>
            </div>

            <form onSubmit={handleSubmit} className="finance-form">
                <div className="form-group">
                    <label>Select Digital Service or Ask Your Question:</label>
                    <div className="topic-buttons">
                        {services.map((s, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`topic-btn ${service === s ? 'active' : ''}`}
                                onClick={() => setService(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        placeholder="Type your digital payment question or select from above..."
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

                <button type="submit" disabled={loading || !service.trim()} className="submit-btn">
                    {loading ? 'Getting Guide...' : 'Get Digital Guide'}
                </button>
            </form>

            {guide && (
                <div className="guidance-result">
                    <div className="result-header">
                        <h3>Digital Service Guide</h3>
                        <button onClick={() => speakText(guide)} className="audio-btn">
                            🔊 Listen
                        </button>
                    </div>
                    <div className="guidance-content">
                        {guide.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DigitalServices;