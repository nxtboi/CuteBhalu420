import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons/Icons';
import { signup } from '../services/authService';
import { User, LanguageCode } from '../types';
import translations from '../services/translations';
import LanguageSelector from './LanguageSelector';

interface SignupPageProps {
  onAuthSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onAuthSuccess, onSwitchToLogin, language, setLanguage }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const t = (translations.signupPage as any)[language];
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await signup(fullName, username, phone, password);
    if (result.success && result.user) {
      onAuthSuccess(result.user);
    } else {
      setError(result.message || 'An unknown error occurred during sign up.');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
            <img 
                src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1974&auto=format&fit=crop"
                alt="Farm background"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 my-4">
            <div className="absolute top-2 right-2">
                <LanguageSelector language={language} setLanguage={setLanguage} className="text-gray-700 hover:bg-gray-100 rounded-md" />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-green-900 tracking-tight drop-shadow-sm">{t.title}</h1>
                <p className="mt-2 text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <form className="space-y-4" onSubmit={handleSignup}>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t.fullNameLabel}</label>
                    <input id="fullName" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phoneLabel}</label>
                    <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t.usernameLabel}</label>
                    <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">{t.passwordLabel}</label>
                    <div className="relative mt-1">
                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
                 <div>
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700">{t.confirmPasswordLabel}</label>
                    <div className="relative mt-1">
                        <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600 text-center">{error}</p></div>}
                
                <div>
                    <button type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"
                    >
                        {t.signupButton}
                    </button>
                </div>
            </form>
             <p className="text-sm text-center text-gray-600 mt-4">
                {t.hasAccount}{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-bold text-green-700 hover:text-green-600 focus:outline-none hover:underline">
                    {t.loginLink}
                </button>
            </p>
        </div>
    </div>
  );
};

export default SignupPage;