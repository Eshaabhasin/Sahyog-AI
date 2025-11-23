import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import Sidebar from '../Sidebar/Sidebar';
import LearningPlanner from '../LearningPlanner/LearningPlanner';
import Quiz from '../Quiz/Quiz';
import DoubtSolver from '../DoubtSolver/DoubtSolver';
import CareerPathfinder from '../CareerPathfinder/CareerPathfinder';
import Farming from '../Farming/Farming';
import Safety from '../Safety/Safety';
import BankingLiteracy from '../Finance/BankingLiteracy';
import PlanningTools from '../Finance/PlanningTools';
import DigitalServices from '../Finance/DigitalServices';
import './Dashboard.css';

function Dashboard() {
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeSection, setActiveSection] = useState('education');
    const { isInstallable, installPWA } = usePWA();
    const educationCards = [
        {
            title: "Learning Planner",
            description: "Creates personalized daily learning plans based on your grade and subjects with audio support in local language."
        },
        {
            title: "Practice Quizzes",
            description: "Generates adaptive quizzes on any topic with AI explanations for every answer in simple language."
        },
        {
            title: "Doubt Solver",
            description: "Ask any question by typing or speaking, get simplified explanations in 3 steps with voice summary."
        },
        {
            title: "Career & Skill Pathfinder",
            description: "Discover career paths, courses, and scholarships based on your interests and grade level."
        }
    ];

    const financeCards = [
        {
            title: "Banking & Digital Literacy",
            description: "Learn bank account opening, UPI setup, ATM usage, and mobile banking tutorials."
        },
        {
            title: "Financial Planning Tools",
            description: "Budget calculator, savings planner, EMI calculator, and investment guidance."
        },
        {
            title: "Digital Financial Services",
            description: "Mobile wallets, QR payments, online bill payments, and money transfers."
        }
    ];

    if (activeComponent === 'learning-planner') {
        return <LearningPlanner onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'quiz') {
        return <Quiz onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'farming') {
        return <Farming onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'safety') {
        return <Safety onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'banking-literacy') {
        return <BankingLiteracy onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'planning-tools') {
        return <PlanningTools onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'digital-services') {
        return <DigitalServices onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'doubt-solver') {
        return <DoubtSolver onBack={() => setActiveComponent(null)} />;
    }

    if (activeComponent === 'career-pathfinder') {
        return <CareerPathfinder onBack={() => setActiveComponent(null)} />;
    }





    return (
        <div className="dashboard">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            <div className="main-content">
                <div className="cards-container">
                    <div className="header-with-install">
                        <h1>{activeSection === 'education' ? 'Education Services' : activeSection === 'farming' ? 'Farming Services' : activeSection === 'safety' ? 'Safety Services' : activeSection === 'finance' ? 'Financial Services' : 'Services'}</h1>
                        {isInstallable && (
                            <button onClick={installPWA} className="install-btn">
                                📱 Install App
                            </button>
                        )}
                    </div>
                    {(activeSection === 'education' ? educationCards : activeSection === 'finance' ? financeCards : []).map((card, index) => (
                        <div 
                            key={index} 
                            className="education-card"
                            onClick={() => {
                                if (card.title === 'Learning Planner') {
                                    setActiveComponent('learning-planner');
                                } else if (card.title === 'Practice Quizzes') {
                                    setActiveComponent('quiz');
                                } else if (card.title === 'Banking & Digital Literacy') {
                                    setActiveComponent('banking-literacy');
                                } else if (card.title === 'Financial Planning Tools') {
                                    setActiveComponent('planning-tools');
                                } else if (card.title === 'Digital Financial Services') {
                                    setActiveComponent('digital-services');
                                } else if (card.title === 'Doubt Solver') {
                                    setActiveComponent('doubt-solver');
                                } else if (card.title === 'Career & Skill Pathfinder') {
                                    setActiveComponent('career-pathfinder');
                                }
                            }}
                        >
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                    ))}
                    
                    {activeSection === 'farming' && (
                        <div 
                            className="education-card"
                            onClick={() => setActiveComponent('farming')}
                        >
                            <h3>Smart Farming Advisory</h3>
                            <p>Get personalized daily farming tasks based on your crop, location, and current weather conditions.</p>
                        </div>
                    )}

                    {activeSection === 'safety' && (
                        <div 
                            className="education-card safety-card"
                            onClick={() => setActiveComponent('safety')}
                        >
                            <h3>🚨 Safety & Emergency Services</h3>
                            <p>Access legal advice, government schemes, SOS emergency support, and live disaster alerts for your area.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;