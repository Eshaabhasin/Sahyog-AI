import React, { useState, useRef } from 'react';
import './LearningPlanner.css';
import jsPDF from 'jspdf';

function LearningPlanner({ onBack }) {
    const [formData, setFormData] = useState({
        topic: '',
        level: '',
        language: 'English'
    });
    const [learningPath, setLearningPath] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData({...formData, topic: transcript});
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const generateLearningPath = async () => {
        if (!formData.topic || !formData.level) return;
        
        setIsGenerating(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/learning-planner/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: formData.topic,
                    level: formData.level,
                    language: formData.language
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setLearningPath(data.learningPath);
            } else {
                setLearningPath(data.error || 'Error generating learning path. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setLearningPath('Failed to connect to server. Please check your connection.');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = () => {
        // Create a simple text file instead of PDF for Unicode support
        const content = `Learning Plan: ${formData.topic}\n\nLanguage: ${formData.language}\nLevel: ${formData.level}\n\n${learningPath}`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formData.topic.replace(/\s+/g, '_')}_learning_plan.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="learning-planner">
            <div className="planner-left">
                <div className="planner-header">
                    <button onClick={onBack} className="back-button">← Back</button>
                    <h2>Learning Planner</h2>
                </div>
                
                <div className="planner-form">
                    <div className="form-group">
                        <label>What topic do you want to learn?</label>
                        <div className="input-with-mic">
                            <input
                                type="text"
                                placeholder="Enter topic (e.g., Python Programming)"
                                value={formData.topic}
                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                            />
                            <button 
                                type="button"
                                className={`mic-button ${isListening ? 'listening' : ''}`}
                                onClick={startListening}
                                disabled={isListening}
                            >
                                🎤
                            </button>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Level</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                        >
                            <option value="">Select Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Simple">Simple</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Language</label>
                        <input
                            type="text"
                            placeholder="Enter language (e.g., Hindi, Spanish, French)"
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        onClick={generateLearningPath}
                        disabled={!formData.topic || !formData.level || isGenerating}
                        className="generate-button"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Learning Path'}
                    </button>
                </div>
            </div>
            
            <div className="planner-right">
                {learningPath && (
                    <div className="learning-path-result">
                        <div className="result-header">
                            <h3>Your Personalized Learning Path</h3>
                            <button onClick={downloadPDF} className="download-btn">
                                📄 Download File
                            </button>
                        </div>
                        <div className="learning-content">
                            {typeof learningPath === 'string' ? 
                                learningPath.split('\n').map((line, index) => (
                                    <p key={index} className={line.startsWith('Day') ? 'day-header' : 'content-line'}>
                                        {line}
                                    </p>
                                )) : 
                                JSON.stringify(learningPath, null, 2)
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LearningPlanner;