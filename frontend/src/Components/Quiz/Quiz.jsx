import React, { useState } from 'react';
import './Quiz.css';

function Quiz({ onBack }) {
    const [formData, setFormData] = useState({
        topic: '',
        language: 'English'
    });
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showScore, setShowScore] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const generateQuiz = async () => {
        if (!formData.topic) return;
        
        setIsGenerating(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/quiz/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: formData.topic,
                    language: formData.language
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setQuiz(data.quiz);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                setShowScore(false);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion]: answerIndex
        });
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowExplanation(false);
        } else {
            setShowScore(true);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const resetQuiz = () => {
        setQuiz(null);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowScore(false);
        setShowExplanation(false);
        setFormData({ topic: '', language: 'English' });
    };

    if (showScore) {
        const score = calculateScore();
        const percentage = Math.round((score / quiz.questions.length) * 100);
        
        return (
            <div className="quiz-full-container">
                <button onClick={onBack} className="back-button">← Back</button>
                <div className="scorecard">
                    <h2>Quiz Complete!</h2>
                    <div className="score-display">
                        <div className="score-circle">
                            <span className="score-text">{score}/{quiz.questions.length}</span>
                            <span className="percentage">{percentage}%</span>
                        </div>
                    </div>
                    <div className="score-details">
                        <p>Correct Answers: {score}</p>
                        <p>Total Questions: {quiz.questions.length}</p>
                        <p>Performance: {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good!' : 'Keep Learning!'}</p>
                    </div>
                    <div className="score-actions">
                        <button onClick={resetQuiz} className="retry-btn">Take Another Quiz</button>
                        <button onClick={onBack} className="back-btn">Back to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    if (quiz) {
        const question = quiz.questions[currentQuestion];
        
        return (
            <div className="quiz-full-container">
                <button onClick={onBack} className="back-button">← Back</button>
                
                <div className="question-card">
                    <div className="question-header">
                        <span className="question-number">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <h2 className="quiz-title">Quiz: {formData.topic}</h2>
                    </div>
                    <h3 className="question-text">{question.question}</h3>
                    <div className="answers">
                        {question.options.map((option, index) => {
                            let buttonClass = 'answer-btn';
                            if (showExplanation && selectedAnswers[currentQuestion] !== undefined) {
                                if (index === question.correctAnswer) {
                                    buttonClass += ' correct';
                                } else if (index === selectedAnswers[currentQuestion]) {
                                    buttonClass += ' incorrect';
                                }
                            } else if (selectedAnswers[currentQuestion] === index) {
                                buttonClass += ' selected';
                            }
                            
                            return (
                                <button
                                    key={index}
                                    className={buttonClass}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showExplanation}
                                >
                                    {String.fromCharCode(65 + index)}. {option}
                                </button>
                            );
                        })}
                    </div>
                    
                    {showExplanation && question.explanation && (
                        <div className="explanation-card">
                            <h4>Explanation:</h4>
                            <p>{question.explanation}</p>
                        </div>
                    )}
                    
                    {showExplanation && !question.explanation && (
                        <div className="explanation-card">
                            <h4>Explanation:</h4>
                            <p>The correct answer is option {String.fromCharCode(65 + question.correctAnswer)}.</p>
                        </div>
                    )}
                    
                    <button 
                        onClick={nextQuestion}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                        className="next-btn"
                    >
                        {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="quiz-left">
                <div className="quiz-header">
                    <button onClick={onBack} className="back-button">← Back</button>
                    <h2>Practice Quiz</h2>
                </div>
                
                <div className="quiz-form">
                    <div className="form-group">
                        <label>What topic do you want to quiz on?</label>
                        <input
                            type="text"
                            placeholder="Enter topic (e.g., Mathematics, Science)"
                            value={formData.topic}
                            onChange={(e) => setFormData({...formData, topic: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Language</label>
                        <input
                            type="text"
                            placeholder="Enter language (e.g., Hindi, Spanish)"
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                        />
                    </div>
                    
                    <button 
                        onClick={generateQuiz}
                        disabled={!formData.topic || isGenerating}
                        className="generate-btn"
                    >
                        {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Quiz;