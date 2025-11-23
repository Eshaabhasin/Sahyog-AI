import React, { useState } from 'react';
import './Farming.css';

function Farming({ onBack }) {
    const [formData, setFormData] = useState({
        cropType: '',
        location: '',
        soilStage: '',
        language: 'Hindi'
    });
    const [advisory, setAdvisory] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const startListening = (field) => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = getLanguageCode(formData.language);

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData({...formData, [field]: transcript});
        };

        recognition.start();
    };

    const generateAdvisory = async () => {
        if (!formData.cropType || !formData.location) return;
        
        setIsGenerating(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/farming/advisory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setAdvisory(data.advisory);
            }
        } catch (error) {
            console.error('Error:', error);
            setAdvisory('Failed to generate advisory. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getLanguageCode = (language) => {
        const langMap = {
            'English': 'en-IN',
            'Hindi': 'hi-IN',
            'Punjabi': 'pa-IN',
            'Marathi': 'mr-IN',
            'Telugu': 'te-IN',
            'Tamil': 'ta-IN'
        };
        return langMap[language] || 'en-IN';
    };

    const speakAdvisory = () => {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis not supported in this browser.');
            return;
        }

        if (!advisory) {
            alert('No advisory content to read.');
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
            
            const utterance = new SpeechSynthesisUtterance(advisory);
            utterance.lang = getLanguageCode(formData.language);
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
        <div className="farming-container">
            <div className="farming-left">
                <div className="farming-header">
                    <button onClick={onBack} className="back-button">← Back</button>
                    <h2>Smart Crop Advisory</h2>
                    <p>आज क्या करना है - Daily Farm Tasks</p>
                </div>
                
                <div className="farming-form">
                    <div className="form-group">
                        <label>Crop Type / फसल का प्रकार</label>
                        <div className="input-with-mic">
                            <input
                                type="text"
                                placeholder="Enter crop (e.g., Wheat, Rice, Cotton)"
                                value={formData.cropType}
                                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                            />
                            <button 
                                type="button"
                                className={`mic-button ${isListening ? 'listening' : ''}`}
                                onClick={() => startListening('cropType')}
                                disabled={isListening}
                            >
                                🎤
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Location / स्थान</label>
                        <div className="input-with-mic">
                            <input
                                type="text"
                                placeholder="Enter location (e.g., Punjab, Maharashtra)"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                            <button 
                                type="button"
                                className={`mic-button ${isListening ? 'listening' : ''}`}
                                onClick={() => startListening('location')}
                                disabled={isListening}
                            >
                                🎤
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Soil Stage / मिट्टी की स्थिति</label>
                        <select
                            value={formData.soilStage}
                            onChange={(e) => setFormData({...formData, soilStage: e.target.value})}
                        >
                            <option value="">Select Soil Stage</option>
                            <option value="Pre-sowing">Pre-sowing / बुआई से पहले</option>
                            <option value="Sowing">Sowing / बुआई</option>
                            <option value="Germination">Germination / अंकुरण</option>
                            <option value="Vegetative">Vegetative / वानस्पतिक</option>
                            <option value="Flowering">Flowering / फूल आना</option>
                            <option value="Maturity">Maturity / पकना</option>
                            <option value="Harvesting">Harvesting / कटाई</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Language / भाषा</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                        >
                            <option value="Hindi">हिंदी (Hindi)</option>
                            <option value="English">English</option>
                            <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                            <option value="Marathi">मराठी (Marathi)</option>
                            <option value="Telugu">తెలుగు (Telugu)</option>
                            <option value="Tamil">தமிழ் (Tamil)</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={generateAdvisory}
                        disabled={!formData.cropType || !formData.location || isGenerating}
                        className="generate-button"
                    >
                        {isGenerating ? 'Generating Advisory...' : 'Get Daily Tasks / दैनिक कार्य प्राप्त करें'}
                    </button>
                </div>
            </div>
            
            <div className="farming-right">
                {advisory && (
                    <div className="advisory-result">
                        <div className="result-header">
                            <h3>Today's Farm Tasks / आज के खेती के काम</h3>
                            <div className="audio-controls">
                                <button onClick={speakAdvisory} className="speak-btn">
                                    {isSpeaking ? 
                                        (isPaused ? '▶️ Resume / फिर से शुरू करें' : '⏸️ Pause / रोकें') : 
                                        '🔊 Listen / सुनें'
                                    }
                                </button>
                                {isSpeaking && (
                                    <button onClick={stopSpeaking} className="stop-btn">
                                        ⏹️ Stop / बंद करें
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="advisory-content">
                            {advisory.split('\n').map((line, index) => (
                                <p key={index} className={
                                    line.includes('Task') || line.includes('काम') || line.includes('Day') ? 'task-header' : 
                                    line.includes('Time') || line.includes('समय') ? 'time-info' :
                                    'content-line'
                                }>
                                    {line}
                                </p>
                            ))}
                        </div>
                        <div className="weather-info">
                            <p>🌤️ Weather-based recommendations included</p>
                            <p>📍 Location-specific advice for {formData.location}</p>
                            <p>🌱 Optimized for {formData.cropType} at {formData.soilStage} stage</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Farming; 