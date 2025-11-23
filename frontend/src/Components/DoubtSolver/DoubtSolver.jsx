import React, { useState } from 'react';
import './DoubtSolver.css';

function DoubtSolver({ onBack }) {
    const [question, setQuestion] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [language, setLanguage] = useState('English');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const subjects = ['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Geography', 'History'];
    const grades = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const languages = ['English', 'Hindi', 'Punjabi', 'Marathi', 'Telugu', 'Tamil'];

    const getLanguageCode = (lang) => {
        const langMap = {
            'English': 'en-IN',
            'Hindi': 'hi-IN',
            'Punjabi': 'pa-IN',
            'Marathi': 'mr-IN',
            'Telugu': 'te-IN',
            'Tamil': 'ta-IN'
        };
        return langMap[lang] || 'en-IN';
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = getLanguageCode(language);

            setIsListening(true);
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setQuestion(transcript);
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
        if (!question.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/education/doubt-solver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, subject, grade, language })
            });

            const data = await response.json();
            if (data.success) {
                setAnswer(data.answer);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis not supported in this browser.');
            return;
        }

        if (!text) {
            alert('No content to read.');
            return;
        }

        if (isSpeaking) {
            if (isPaused) {
                speechSynthesis.resume();
                setIsPaused(false);
            } else {
                speechSynthesis.pause();
                setIsPaused(true);
            }
        } else {
            // Stop any existing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = getLanguageCode(language);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };
            
            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                setIsPaused(false);
                alert('Speech playback failed. Please try again.');
            };
            
            // Small delay to ensure proper initialization
            setTimeout(() => {
                speechSynthesis.speak(utterance);
            }, 100);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    return (
        <div className="doubt-solver-container">
            <div className="doubt-header">
                <button onClick={onBack} className="back-button">← Back</button>
                <h1>Doubt Solver</h1>
            </div>

            <div className="doubt-content">
                <div className="left-panel">
                    <form onSubmit={handleSubmit} className="doubt-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Subject (Optional):</label>
                                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Grade (Optional):</label>
                                <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                                    <option value="">Select Grade</option>
                                    {grades.map(gr => (
                                        <option key={gr} value={gr}>{gr}</option>
                                    ))}
                                </select>
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

                        <div className="form-group">
                            <label>Ask Your Question:</label>
                            <div className="question-input-group">
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Type your question here or use voice input..."
                                    className="question-input"
                                    rows="4"
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
                        </div>

                        <button type="submit" disabled={loading || !question.trim()} className="submit-btn">
                            {loading ? 'Getting Answer...' : 'Solve My Doubt'}
                        </button>
                    </form>
                </div>

                <div className="right-panel">
                    {answer ? (
                        <div className="answer-result">
                            <div className="result-header">
                                <h3>Answer</h3>
                                <div className="audio-controls">
                                    <button onClick={() => speakText(answer)} className="speak-btn">
                                        {isSpeaking ? 
                                            (isPaused ? '▶️ Resume' : '⏸️ Pause') : 
                                            '🔊 Listen'
                                        }
                                    </button>
                                    {isSpeaking && (
                                        <button onClick={stopSpeaking} className="stop-btn">
                                            ⏹️ Stop
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="answer-content">
                                {answer.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="answer-placeholder">
                            <div className="placeholder-content">
                                <h3>Answer will appear here</h3>
                                <p>Ask your question and the answer will be displayed in this panel.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoubtSolver;