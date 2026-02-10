<div align="center">
<img width="1200" height="475" alt="Krishi Mitra AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🌾 Krishi Mitra AI

**An intelligent agricultural assistant empowering Indian farmers with AI-driven insights**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

</div>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## 🎯 About

**Krishi Mitra AI** is an AI-powered chat assistant designed specifically for farmers in India. It provides comprehensive agricultural support including:

- 🌱 Crop planning and recommendations
- 🐛 Crop health analysis and disease detection
- 🔧 Innovative tool and equipment solutions
- 🌍 Geolocation-based insights
- 🗣️ Multilingual voice and text interface

The application leverages Google's Gemini API to provide intelligent, context-aware agricultural guidance, helping farmers make informed decisions and improve their yields.

## ✨ Key Features

- **AI-Powered Chat Interface** - Real-time conversations with an intelligent agricultural assistant
- **Multilingual Support** - Voice and text input in multiple Indian languages
- **Voice Recognition** - Hands-free operation using microphone input
- **Crop Health Analysis** - AI-driven disease detection and crop assessment
- **Smart Recommendations** - Personalized crop planning and tool suggestions
- **User Authentication** - Secure login and profile management
- **Admin Dashboard** - Management interface for content and translations
- **Irrigation Planning** - Smart irrigation scheduling and water management
- **Product Shop** - Integrated marketplace for agricultural products
- **Chat History** - Persistent conversation tracking
- **Dark/Light Theme Support** - Customizable UI experience

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.4 - UI library
- **TypeScript** 5.8 - Type-safe development
- **Vite** 6.2 - Build tool and dev server
- **React DOM** 19.2.4 - DOM rendering

### Backend/AI
- **Google Gemini API** - AI conversation engine
- **Python** - Server-side utilities

### Styling & UI
- **React Syntax Highlighter** - Code display component

### Development
- **Node.js** 18+ - JavaScript runtime
- **npm** - Package manager

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Usually comes with Node.js
- **Python** 3.8+ (for backend utilities)
- **Gemini API Key** - Get it from [Google AI Studio](https://ai.google.dev)

Verify installation:
```bash
node --version
npm --version
```

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/krishi-mitra-ai.git
cd krishi-mitra-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://ai.google.dev).

### 4. Verify Installation
```bash
npm run dev
```

## 🏃 Getting Started

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Features to Explore

1. **Login/Signup** - Create an account or log in
2. **Chat Interface** - Start a conversation with the AI assistant
3. **Irrigation Planner** - Plan irrigation schedules
4. **Product Shop** - Browse agricultural products
5. **Admin Dashboard** - (Admin only) Manage content and translations
6. **Profile** - View and update your profile

## 📁 Project Structure

```
krishi-mitra-ai/
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminPage.tsx
│   │   ├── CodeEditorPage.tsx
│   │   ├── TranslationsEditor.tsx
│   │   └── UserManagementPage.tsx
│   ├── icons/              # Icon components
│   ├── ChatPage.tsx        # Main chat interface
│   ├── ChatWindow.tsx      # Chat message display
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Header.tsx          # Navigation header
│   ├── InputBar.tsx        # Message input
│   ├── IrrigationPlannerPage.tsx
│   ├── LanguageSelector.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ShopPage.tsx
│   └── ...
├── hooks/                   # Custom React hooks
│   └── useVoiceRecognition.ts
├── services/                # API & business logic
│   ├── api.ts              # API calls
│   ├── authService.ts      # Authentication
│   ├── chatHistoryService.ts
│   ├── geminiService.ts    # Gemini API integration
│   └── translations.ts
├── App.tsx                 # Root component
├── AppContainer.tsx        # App wrapper
├── main.py                 # Python utilities
├── index.tsx               # React entry point
├── types.ts                # TypeScript types
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` file with:

```env
# Required
VITE_GEMINI_API_KEY=sk-xxxxxxxxxxxxx

# Optional
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Krishi Mitra AI
```

### Gemini API Setup

1. Visit [Google AI Studio](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env.local`

## 📜 Scripts

Run these commands in the project directory:

```bash
# Development server
npm run dev              # Start Vite dev server

# Production build
npm run build            # Build for production

# Preview production build
npm run preview          # Preview production build locally
```

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

This generates the optimized files in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment

The built files in `dist/` can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service
- Docker container
- Traditional web server (Apache, Nginx, etc.)

**Example Netlify Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to help:

### Getting Started with Development

1. **Fork the repository** on GitHub
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/krishi-mitra-ai.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Test thoroughly**
   ```bash
   npm run build
   npm run preview
   ```
6. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Coding Standards

- Use **TypeScript** for type safety
- Follow **React best practices**
- Write **meaningful commit messages**
- Keep functions **small and focused**
- Add **comments** for complex logic

### Code Style

- Use ESLint configuration (if available)
- Format code with Prettier (if available)
- Follow existing naming conventions

## 💬 Support

### Getting Help

- **Issues** - Report bugs or request features via [GitHub Issues](https://github.com/yourusername/krishi-mitra-ai/issues)
- **Discussions** - Join community discussions
- **Documentation** - Check this README and code comments
- **Email** - Contact: support@krishimitra.co.in

### Report a Bug

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs (if applicable)
- Your environment (Node version, OS, browser)

### Feature Requests

Share your ideas for improvements or new features by opening an issue with the `enhancement` label.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Liability and warranty

## 🙏 Acknowledgments

- **Google Gemini API** - For AI capabilities
- **React & Vite** - For awesome development tools
- **Community Contributors** - For their support and feedback
- **Farmers & Agriculture Expert** - For feedback and requirements

## 📞 Contact & Social

- **Email**: support@krishimitra.co.in
- **Website**: [Krishi Mitra AI](https://krishimitrai.com)
- **AI Studio**: [View on AI Studio](https://ai.studio/apps/drive/1ZBegRoFadngHfbiZKiEbISuLPOahe4S4)

---

<div align="center">

Made with ❤️ for Indian Farmers

![GitHub stars](https://img.shields.io/github/stars/yourusername/krishi-mitra-ai?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/krishi-mitra-ai?style=social)

</div>
