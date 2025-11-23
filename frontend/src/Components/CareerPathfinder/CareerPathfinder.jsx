import React, { useState } from 'react';
import './CareerPathfinder.css';

function CareerPathfinder({ onBack }) {
    const [formData, setFormData] = useState({
        interests: '',
        skills: '',
        education: '',
        experience: '',
        goals: '',
        language: 'English'
    });
    const [pathfinder, setPathfinder] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const educationLevels = ['10th Grade', '12th Grade', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'];
    const experienceLevels = ['Fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'];
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

    const startListening = (field) => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = getLanguageCode(formData.language);

            setIsListening(true);
            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setFormData({...formData, [field]: transcript});
                setIsListening(false);
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.interests.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/career/pathfinder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setPathfinder(data.pathfinder);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const speakPathfinder = () => {
        if ('speechSynthesis' in window && pathfinder) {
            if (isSpeaking) {
                if (isPaused) {
                    speechSynthesis.resume();
                    setIsPaused(false);
                } else {
                    speechSynthesis.pause();
                    setIsPaused(true);
                }
            } else {
                const utterance = new SpeechSynthesisUtterance(pathfinder);
                utterance.lang = getLanguageCode(formData.language);
                utterance.rate = 0.8;
                utterance.onstart = () => {
                    setIsSpeaking(true);
                    setIsPaused(false);
                };
                utterance.onend = () => {
                    setIsSpeaking(false);
                    setIsPaused(false);
                };
                speechSynthesis.speak(utterance);
            }
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
        <div className="career-pathfinder-container">
            <div className="career-header">
                <button onClick={onBack} className="back-button">← Back</button>
                <h1>Career & Skill Pathfinder</h1>
            </div>

            <div className="career-content">
                <div className="left-panel">
                    <form onSubmit={handleSubmit} className="career-form">
                        <div className="form-group">
                            <label>Your Interests:</label>
                            <div className="input-with-voice">
                                <textarea
                                    value={formData.interests}
                                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                    placeholder="What are you passionate about? (e.g., technology, art, business)"
                                    rows="3"
                                />
                                <button
                                    type="button"
                                    onClick={() => startListening('interests')}
                                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                                    disabled={isListening}
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Your Skills:</label>
                            <div className="input-with-voice">
                                <textarea
                                    value={formData.skills}
                                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                    placeholder="What skills do you have? (e.g., programming, communication, design)"
                                    rows="3"
                                />
                                <button
                                    type="button"
                                    onClick={() => startListening('skills')}
                                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                                    disabled={isListening}
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Education Level:</label>
                                <select value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})}>
                                    <option value="">Select Education</option>
                                    {educationLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Experience Level:</label>
                                <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                                    <option value="">Select Experience</option>
                                    {experienceLevels.map(exp => (
                                        <option key={exp} value={exp}>{exp}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Language:</label>
                                <select value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                                    {languages.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Career Goals (Optional):</label>
                            <div className="input-with-voice">
                                <textarea
                                    value={formData.goals}
                                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                                    placeholder="What are your career aspirations?"
                                    rows="2"
                                />
                                <button
                                    type="button"
                                    onClick={() => startListening('goals')}
                                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                                    disabled={isListening}
                                >
                                    🎤
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !formData.interests.trim()} className="submit-btn">
                            {loading ? 'Generating Path...' : 'Find My Career Path'}
                        </button>
                    </form>
                </div>

                <div className="right-panel">
                    {pathfinder ? (
                        <div className="pathfinder-result">
                            <div className="result-header">
                                <h3>Your Career Pathfinder</h3>
                                <div className="audio-controls">
                                    <button onClick={speakPathfinder} className="speak-btn">
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
                            <div className="pathfinder-content">
                                {pathfinder.split('\n').map((line, index) => (
                                    <p key={index} className={
                                        line.includes('Career Path') || line.includes('Recommended') ? 'path-header' :
                                        line.includes('Skills to Develop') || line.includes('Next Steps') ? 'section-header' :
                                        'content-line'
                                    }>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="pathfinder-placeholder">
                            <div className="placeholder-content">
                                <h3>Career guidance will appear here</h3>
                                <p>Fill in your interests and skills to get personalized career recommendations.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CareerPathfinder;