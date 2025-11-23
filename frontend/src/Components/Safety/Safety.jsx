import React, { useState, useRef } from 'react';
import './Safety.css';

function Safety({ onBack }) {
    const [activeTab, setActiveTab] = useState('legal');
    
    // Legal Awareness State
    const [legalFormData, setLegalFormData] = useState({
        issue: '',
        language: 'English'
    });
    const [legalAdvice, setLegalAdvice] = useState('');
    const [isGeneratingLegal, setIsGeneratingLegal] = useState(false);

    // Government Schemes State
    const [schemesFormData, setSchemesFormData] = useState({
        category: '',
        state: '',
        beneficiary: ''
    });
    const [schemes, setSchemes] = useState('');
    const [isGeneratingSchemes, setIsGeneratingSchemes] = useState(false);

    // SOS State
    const [sosActivated, setSosActivated] = useState(false);
    const [holdTimer, setHoldTimer] = useState(null);
    const [location, setLocation] = useState(null);

    // Live Alerts State
    const [alertLocation, setAlertLocation] = useState('');
    const [alerts, setAlerts] = useState('');
    const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

    // Legal Awareness Functions
    const generateLegalAdvice = async () => {
        if (!legalFormData.issue) return;
        
        setIsGeneratingLegal(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/safety/legal-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(legalFormData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setLegalAdvice(data.advice);
            } else {
                setLegalAdvice('Error: ' + (data.error || 'Failed to generate advice'));
            }
        } catch (error) {
            console.error('Error:', error);
            setLegalAdvice('Failed to connect to server.');
        } finally {
            setIsGeneratingLegal(false);
        }
    };

    const speakLegalAdvice = () => {
        if ('speechSynthesis' in window && legalAdvice) {
            const utterance = new SpeechSynthesisUtterance(legalAdvice);
            utterance.lang = legalFormData.language === 'Hindi' ? 'hi-IN' : 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    const downloadLegalAdvice = () => {
        const content = `Legal Advice: ${legalFormData.issue}\n\nLanguage: ${legalFormData.language}\n\n${legalAdvice}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `legal_advice_${legalFormData.issue.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Government Schemes Functions
    const generateSchemes = async () => {
        if (!schemesFormData.category || !schemesFormData.state) return;
        
        setIsGeneratingSchemes(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/safety/schemes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schemesFormData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSchemes(data.schemes);
            } else {
                setSchemes('Error: ' + (data.error || 'Failed to fetch schemes'));
            }
        } catch (error) {
            console.error('Error:', error);
            setSchemes('Failed to connect to server.');
        } finally {
            setIsGeneratingSchemes(false);
        }
    };

    // SOS Functions
    const handleSOSPress = () => {
        const timer = setTimeout(() => {
            activateSOS();
        }, 3000);
        setHoldTimer(timer);
    };

    const handleSOSRelease = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
    };

    const activateSOS = async () => {
        setSosActivated(true);
        
        // Get location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(loc);
                
                // Log SOS to backend
                fetch('http://localhost:5001/api/safety/sos-log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: loc })
                }).catch(err => console.error('SOS log error:', err));
            });
        }
    };

    const shareLocation = () => {
        if (location) {
            const message = `🚨 EMERGENCY! My location: https://www.google.com/maps?q=${location.lat},${location.lng}`;
            if (navigator.share) {
                navigator.share({ text: message }).catch(err => console.error('Share error:', err));
            } else {
                navigator.clipboard.writeText(message);
                alert('Location copied to clipboard!');
            }
        }
    };

    const makeFakeCall = () => {
        window.location.href = 'tel:+911234567890';
    };

    const deactivateSOS = () => {
        setSosActivated(false);
        setLocation(null);
    };

    // Live Alerts Functions
    const fetchAlerts = async () => {
        if (!alertLocation) return;
        
        setIsLoadingAlerts(true);
        
        try {
            const response = await fetch('http://localhost:5001/api/safety/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: alertLocation })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setAlerts(data.alerts);
            } else {
                setAlerts('Error: ' + (data.error || 'Failed to fetch alerts'));
            }
        } catch (error) {
            console.error('Error:', error);
            setAlerts('Failed to connect to server.');
        } finally {
            setIsLoadingAlerts(false);
        }
    };

    return (
        <div className="safety-container">
            <div className="safety-header">
                <button onClick={onBack} className="back-button">← Back</button>
                <h2>Safety & Emergency Services</h2>
            </div>

            <div className="safety-tabs">
                <button 
                    className={`tab ${activeTab === 'legal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('legal')}
                >
                    ⚖️ Legal Awareness
                </button>
                <button 
                    className={`tab ${activeTab === 'schemes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schemes')}
                >
                    🏛️ Government Schemes
                </button>
                <button 
                    className={`tab ${activeTab === 'sos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sos')}
                >
                    🚨 SOS Emergency
                </button>
                <button 
                    className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    ⚠️ Live Alerts
                </button>
            </div>

            <div className="safety-content">
                {/* Legal Awareness Tab */}
                {activeTab === 'legal' && (
                    <div className="legal-section">
                        <div className="section-left">
                            <h3>Know Your Rights</h3>
                            <p>Get instant legal guidance in simple language</p>
                            
                            <div className="form-group">
                                <label>Select Legal Issue</label>
                                <select
                                    value={legalFormData.issue}
                                    onChange={(e) => setLegalFormData({...legalFormData, issue: e.target.value})}
                                >
                                    <option value="">Select Issue</option>
                                    <option value="Labor Rights">Labor Rights / मजदूर अधिकार</option>
                                    <option value="Domestic Violence">Domestic Violence / घरेलू हिंसा</option>
                                    <option value="Land Disputes">Land Disputes / भूमि विवाद</option>
                                    <option value="Consumer Rights">Consumer Rights / उपभोक्ता अधिकार</option>
                                    <option value="Police Complaint">How to File Police Complaint / FIR</option>
                                    <option value="Women's Rights">Women's Rights / महिला अधिकार</option>
                                    <option value="Child Rights">Child Rights / बाल अधिकार</option>
                                    <option value="Property Rights">Property Rights / संपत्ति अधिकार</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Language / भाषा</label>
                                <select
                                    value={legalFormData.language}
                                    onChange={(e) => setLegalFormData({...legalFormData, language: e.target.value})}
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">हिंदी (Hindi)</option>
                                    <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                                    <option value="Marathi">मराठी (Marathi)</option>
                                    <option value="Bengali">বাংলা (Bengali)</option>
                                </select>
                            </div>

                            <button 
                                onClick={generateLegalAdvice}
                                disabled={!legalFormData.issue || isGeneratingLegal}
                                className="generate-btn"
                            >
                                {isGeneratingLegal ? 'Generating Advice...' : 'Get Legal Guidance'}
                            </button>
                        </div>

                        <div className="section-right">
                            {legalAdvice && (
                                <div className="advice-result">
                                    <div className="result-header">
                                        <h3>Legal Guidance</h3>
                                        <div className="result-actions">
                                            <button onClick={speakLegalAdvice} className="action-btn">
                                                🔊 Listen
                                            </button>
                                            <button onClick={downloadLegalAdvice} className="action-btn">
                                                📄 Download
                                            </button>
                                        </div>
                                    </div>
                                    <div className="advice-content">
                                        {legalAdvice.split('\n').map((line, index) => (
                                            <p key={index} className={line.includes('Step') || line.includes('Important') ? 'highlight' : ''}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Government Schemes Tab */}
                {activeTab === 'schemes' && (
                    <div className="schemes-section">
                        <div className="section-left">
                            <h3>Government Schemes & Benefits</h3>
                            <p>Find schemes you're eligible for</p>

                            <div className="form-group">
                                <label>Category / श्रेणी</label>
                                <select
                                    value={schemesFormData.category}
                                    onChange={(e) => setSchemesFormData({...schemesFormData, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Agriculture">Agriculture / कृषि</option>
                                    <option value="Education">Education / शिक्षा</option>
                                    <option value="Health">Health / स्वास्थ्य</option>
                                    <option value="Housing">Housing / आवास</option>
                                    <option value="Women Welfare">Women Welfare / महिला कल्याण</option>
                                    <option value="Child Welfare">Child Welfare / बाल कल्याण</option>
                                    <option value="Employment">Employment / रोजगार</option>
                                    <option value="Financial Assistance">Financial Assistance / वित्तीय सहायता</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>State / राज्य</label>
                                <input
                                    type="text"
                                    placeholder="Enter your state (e.g., Punjab, Maharashtra)"
                                    value={schemesFormData.state}
                                    onChange={(e) => setSchemesFormData({...schemesFormData, state: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Beneficiary Type (Optional)</label>
                                <select
                                    value={schemesFormData.beneficiary}
                                    onChange={(e) => setSchemesFormData({...schemesFormData, beneficiary: e.target.value})}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Farmer">Farmer / किसान</option>
                                    <option value="Student">Student / छात्र</option>
                                    <option value="Woman">Woman / महिला</option>
                                    <option value="Senior Citizen">Senior Citizen / वरिष्ठ नागरिक</option>
                                    <option value="Disabled">Disabled / विकलांग</option>
                                    <option value="Youth">Youth / युवा</option>
                                </select>
                            </div>

                            <button 
                                onClick={generateSchemes}
                                disabled={!schemesFormData.category || !schemesFormData.state || isGeneratingSchemes}
                                className="generate-btn"
                            >
                                {isGeneratingSchemes ? 'Searching Schemes...' : 'Find Eligible Schemes'}
                            </button>
                        </div>

                        <div className="section-right">
                            {schemes && (
                                <div className="schemes-result">
                                    <h3>Available Schemes</h3>
                                    <div className="schemes-content">
                                        {schemes.split('\n').map((line, index) => (
                                            <p key={index} className={
                                                line.includes('Scheme') || line.includes('योजना') ? 'scheme-title' :
                                                line.includes('Eligibility') || line.includes('पात्रता') ? 'eligibility' :
                                                ''
                                            }>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SOS Emergency Tab */}
                {activeTab === 'sos' && (
                    <div className="sos-section">
                        {!sosActivated ? (
                            <div className="sos-inactive">
                                <h3>Emergency SOS</h3>
                                <p>Hold the button for 3 seconds to activate emergency mode</p>
                                
                                <button 
                                    className="sos-button"
                                    onMouseDown={handleSOSPress}
                                    onMouseUp={handleSOSRelease}
                                    onTouchStart={handleSOSPress}
                                    onTouchEnd={handleSOSRelease}
                                >
                                    <span className="sos-icon">🚨</span>
                                    <span className="sos-text">HOLD FOR SOS</span>
                                </button>

                                <div className="emergency-contacts">
                                    <h4>Emergency Helplines</h4>
                                    <div className="contacts-grid">
                                        <a href="tel:100" className="contact-card">
                                            <span className="contact-icon">👮</span>
                                            <span className="contact-name">Police</span>
                                            <span className="contact-number">100</span>
                                        </a>
                                        <a href="tel:102" className="contact-card">
                                            <span className="contact-icon">🚑</span>
                                            <span className="contact-name">Ambulance</span>
                                            <span className="contact-number">102</span>
                                        </a>
                                        <a href="tel:1091" className="contact-card">
                                            <span className="contact-icon">👩</span>
                                            <span className="contact-name">Women Helpline</span>
                                            <span className="contact-number">1091</span>
                                        </a>
                                        <a href="tel:1098" className="contact-card">
                                            <span className="contact-icon">👶</span>
                                            <span className="contact-name">Child Helpline</span>
                                            <span className="contact-number">1098</span>
                                        </a>
                                        <a href="tel:181" className="contact-card">
                                            <span className="contact-icon">🏥</span>
                                            <span className="contact-name">Women & Child</span>
                                            <span className="contact-number">181</span>
                                        </a>
                                        <a href="tel:1800-180-1111" className="contact-card">
                                            <span className="contact-icon">🤝</span>
                                            <span className="contact-name">Disaster Helpline</span>
                                            <span className="contact-number">1800-180-1111</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sos-active">
                                <div className="sos-alert">
                                    <h2>🚨 SOS ACTIVATED 🚨</h2>
                                    <p>Emergency mode is active</p>
                                </div>

                                <div className="sos-actions">
                                    <button onClick={shareLocation} className="action-btn-large">
                                        📍 Share My Location
                                    </button>
                                    <button onClick={makeFakeCall} className="action-btn-large">
                                        📞 Fake Call (Safety Exit)
                                    </button>
                                    <button onClick={deactivateSOS} className="action-btn-large cancel">
                                        ❌ Cancel SOS
                                    </button>
                                </div>

                                {location && (
                                    <div className="location-info">
                                        <p>📍 Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                                        <a 
                                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="map-link"
                                        >
                                            View on Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Live Alerts Tab */}
                {activeTab === 'alerts' && (
                    <div className="alerts-section">
                        <div className="section-left">
                            <h3>Disaster & Weather Alerts</h3>
                            <p>Get real-time alerts for your area</p>

                            <div className="form-group">
                                <label>Location / स्थान</label>
                                <input
                                    type="text"
                                    placeholder="Enter city, district or state"
                                    value={alertLocation}
                                    onChange={(e) => setAlertLocation(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={fetchAlerts}
                                disabled={!alertLocation || isLoadingAlerts}
                                className="generate-btn"
                            >
                                {isLoadingAlerts ? 'Loading Alerts...' : 'Get Live Alerts'}
                            </button>

                            <div className="alert-types">
                                <h4>Alert Types:</h4>
                                <ul>
                                    <li>🌊 Flood Warnings</li>
                                    <li>🌾 Drought Conditions</li>
                                    <li>🌀 Cyclone Alerts</li>
                                    <li>🏔️ Earthquake Updates</li>
                                    <li>🌡️ Heatwave Warnings</li>
                                    <li>❄️ Cold Wave Alerts</li>
                                    <li>⚡ Storm Warnings</li>
                                </ul>
                            </div>
                        </div>

                        <div className="section-right">
                            {alerts && (
                                <div className="alerts-result">
                                    <h3>⚠️ Active Alerts for {alertLocation}</h3>
                                    <div className="alerts-content">
                                        {alerts.split('\n').map((line, index) => (
                                            <p key={index} className={
                                                line.includes('SEVERE') || line.includes('गंभीर') ? 'alert-severe' :
                                                line.includes('MODERATE') || line.includes('मध्यम') ? 'alert-moderate' :
                                                line.includes('ADVISORY') ? 'alert-advisory' :
                                                ''
                                            }>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Safety;
