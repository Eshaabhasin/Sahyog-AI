import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ activeSection, onSectionChange }) {
    const menuItems = [
        { name: 'education', label: 'Education', emoji: '📚' },
        { name: 'finance', label: 'Finance', emoji: '💰' },
        { name: 'safety', label: 'Safety', emoji: '🛡️' },
        { name: 'farming', label: 'Farming', emoji: '🌾' },
    ];

    return (
        <div className="sidebar">
            <div className="logo">
                <h2>Sahyog AI</h2>
            </div>
            <div className="menu-items">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`menu-item ${activeSection === item.name ? 'active' : ''}`}
                        onClick={() => onSectionChange(item.name)}
                    >
                        <span className="emoji">{item.emoji}</span>
                        <span className="text">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;