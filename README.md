# 🌟 Sahyog-AI

**Empowering Rural Communities Through AI-Powered Education and Support**

Sahyog-AI is a comprehensive Progressive Web Application (PWA) designed to bridge the digital divide and provide essential services to underserved communities in India. Built with React and powered by Groq's Llama AI, it offers multilingual support and offline capabilities.

## 🎯 Mission

To democratize access to education, financial literacy, agricultural guidance, and safety resources for rural and underserved communities across India.

## ✨ Features

### 📚 **Learning & Education**
- **Learning Planner**: AI-generated 7-day learning plans tailored for low-resource environments
- **Quiz System**: Interactive quizzes with explanations in multiple languages
- **Doubt Solver**: AI tutor for academic questions with simple, step-by-step explanations

### 🌾 **Agricultural Support**
- **Farming Advisory**: Daily farming tasks and recommendations based on crop type and location
- **Weather-based Guidance**: Seasonal and weather-specific agricultural advice
- **Crop Management**: Soil stage analysis and fertilizer recommendations

### 🛡️ **Safety & Legal Aid**
- **Legal Advice**: Simple explanations of rights and legal procedures
- **Government Schemes**: Information about available welfare programs
- **SOS System**: Emergency alert system with location tracking
- **Disaster Alerts**: Real-time warnings and safety measures

### 💰 **Financial Literacy**
- **Banking Literacy**: Step-by-step guides for digital banking
- **Budget Planning**: Personal finance management tools
- **Digital Payments**: Tutorials for UPI, mobile wallets, and online banking
- **Investment Guidance**: Simple investment advice for rural communities

### 🎯 **Career Development**
- **Career Pathfinder**: Personalized career guidance based on interests and skills
- **Skill Development**: Free and low-cost learning resources
- **Government Programs**: Information about skill development schemes

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - Modern UI framework
- **Vite 7.2.2** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **jsPDF** - PDF generation
- **PWA Support** - Offline functionality and app-like experience

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Groq SDK** - AI integration with Llama models
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn package manager
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sahyog-ai.git
   cd sahyog-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5001
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

## 📱 PWA Features

- **Offline Support**: Core functionality works without internet
- **App-like Experience**: Install on mobile devices and desktops
- **Service Worker**: Caches resources for faster loading
- **Responsive Design**: Optimized for all screen sizes
- **Cross-platform**: Works on Android, iOS, and desktop browsers

## 🌐 API Endpoints

### Learning & Education
- `POST /api/learning-planner/generate` - Generate learning plans
- `POST /api/quiz/generate` - Create topic-based quizzes
- `POST /api/education/doubt-solver` - Solve academic doubts

### Agricultural Support
- `POST /api/farming/advisory` - Get farming recommendations

### Safety & Legal
- `POST /api/safety/legal-advice` - Legal guidance
- `POST /api/safety/schemes` - Government schemes info
- `POST /api/safety/sos-log` - Emergency logging
- `POST /api/safety/alerts` - Disaster alerts

### Financial Services
- `POST /api/finance/banking-literacy` - Banking tutorials
- `POST /api/finance/planning-tools` - Financial planning
- `POST /api/finance/digital-services` - Digital payment guides

### Career Development
- `POST /api/career/pathfinder` - Career guidance

## 🏗️ Project Structure

```
sahyog-ai/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── Components/   # React components
│   │   │   ├── Dashboard/
│   │   │   ├── LearningPlanner/
│   │   │   ├── Quiz/
│   │   │   ├── Farming/
│   │   │   ├── Safety/
│   │   │   ├── Finance/
│   │   │   ├── CareerPathfinder/
│   │   │   └── DoubtSolver/
│   │   ├── hooks/        # Custom React hooks
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
└── README.md
```

## 🌍 Multilingual Support

Sahyog-AI supports multiple Indian languages:
- English
- Hindi
- Regional languages (configurable)

All AI responses and UI elements can be localized based on user preference.

## 🔧 Configuration

### Vite Configuration
The frontend uses Vite with React plugin and PWA support:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true
  }
})
```

### Environment Variables
```env
# Backend
PORT=5001
GROQ_API_KEY=your_groq_api_key

# Add other environment variables as needed
```

## 🚀 Deployment

### Frontend (Vite Build)
```bash
cd frontend
npm run build
npm run preview
```

### Backend (Production)
```bash
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing AI capabilities through Llama models
- **React Team** for the excellent frontend framework
- **Vite** for the fast development experience
- **Open Source Community** for the amazing tools and libraries


**Made with ❤️ for Rural India**

*Bridging the digital divide, one community at a time.*
