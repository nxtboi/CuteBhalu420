import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons/Icons';
import { login } from '../services/authService';
import { User, LanguageCode } from '../types';
import translations from '../services/translations';
import LanguageSelector from './LanguageSelector';
import PasswordResetModal from './PasswordResetModal';

interface LoginPageProps {
  onAuthSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess, onSwitchToSignup, language, setLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const t = (translations.loginPage as any)[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.trim() && password.trim()) {
      const result = await login(username, password, rememberMe);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setError(result.message || 'An unknown error occurred.');
      }
    } else {
      setError('Please enter both username and password.');
    }
  };

  return (
    <>
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 overflow-hidden">
            <img 
                src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1974&auto=format&fit=crop"
                alt="Farm background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-sm p-8 space-y-6 bg-stone-50 rounded-2xl shadow-lg">
            <div className="absolute top-4 right-4">
                <div className="border border-gray-300 rounded-md">
                    <LanguageSelector language={language} setLanguage={setLanguage} className="text-gray-600 hover:bg-gray-100" />
                </div>
            </div>
            <div className="text-center pt-6">
                <h1 className="text-3xl font-bold text-green-800 tracking-tight">{t.title}</h1>
                <p className="mt-2 text-sm text-gray-500">{t.subtitle}</p>
            </div>
            <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700"
                    >
                        {t.usernameLabel}
                    </label>
                    <div className="mt-1">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t.passwordLabel}
                        </label>
                        <div className="text-sm">
                            <button type="button" onClick={() => setIsResetModalOpen(true)} className="font-medium text-green-600 hover:text-green-500 focus:outline-none">
                            {t.forgotPasswordLink}
                            </button>
                        </div>
                    </div>
                    <div className="relative mt-1">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        {t.rememberMeLabel}
                    </label>
                </div>

                {error && <div className="p-3 bg-red-100 border border-red-200 rounded-md"><p className="text-sm text-red-700 text-center">{error}</p></div>}
                
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        {t.loginButton}
                    </button>
                </div>
            </form>
            <p className="text-sm text-center text-gray-600 !mt-6">
                {t.noAccount}{' '}
                <button type="button" onClick={onSwitchToSignup} className="font-medium text-green-600 hover:text-green-500 focus:outline-none">
                    {t.signUpLink}
                </button>
            </p>
        </div>
    </div>
    {isResetModalOpen && <PasswordResetModal onClose={() => setIsResetModalOpen(false)} language={language}/>}
    </>
  );
};

export default LoginPage;