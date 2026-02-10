import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons/Icons';
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword } from '../services/authService';
import { LanguageCode } from '../types';
import translations from '../services/translations';

interface PasswordResetModalProps {
  onClose: () => void;
  language: LanguageCode;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose, language }) => {
  const [step, setStep] = useState<'enterUsername' | 'verifyOtp' | 'resetPassword'>('enterUsername');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [maskedPhoneNumber, setMaskedPhoneNumber] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const t = (translations.passwordResetModal as any)[language];

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await requestPasswordResetOtp(username);
    
    if (result.success && result.maskedPhone) {
      // Simulate sending SMS by showing an alert with the code
      if (result.otp) {
        alert(`[SIMULATED SMS]\nYour OTP is: ${result.otp}`);
      }
      setMaskedPhoneNumber(result.maskedPhone);
      setStep('verifyOtp');
    } else {
      setError(result.message || t.userNotFoundError);
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const isValid = await verifyPasswordResetOtp(username, otp);
    
    if (isValid) {
      setStep('resetPassword');
    } else {
      setError(t.invalidOtpError);
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatchError);
      return;
    }
    
    setIsLoading(true);
    const result = await resetPassword(username, newPassword);

    if (result.success) {
      setSuccess(t.passwordResetSuccess);
      setTimeout(() => {
          onClose();
      }, 2000);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
            &times;
        </button>
        
        {step === 'enterUsername' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-stone-800">{t.title}</h2>
            <p className="mt-2 text-center text-gray-500">{t.enterUsernamePrompt}</p>
            <form className="mt-6 space-y-4" onSubmit={handleUsernameSubmit}>
              <div>
                <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700">{t.usernameLabel}</label>
                <input
                  id="reset-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500"
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:bg-gray-400">
                {isLoading ? 'Sending...' : t.continueButton}
              </button>
            </form>
          </div>
        )}

        {step === 'verifyOtp' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-stone-800">{t.title}</h2>
            <p className="mt-2 text-center text-green-600 text-sm">{t.otpSentMessage.replace('{phone}', maskedPhoneNumber)}</p>
            <form className="mt-6 space-y-4" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700">{t.otpLabel}</label>
                <input
                  id="otp-input"
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                  className="mt-1 w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500 text-center tracking-widest text-lg"
                  placeholder="XXXX"
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:bg-gray-400">
                {isLoading ? 'Verifying...' : t.verifyButton}
              </button>
            </form>
          </div>
        )}

        {step === 'resetPassword' && (
          <div>
            <h2 className="text-2xl font-bold text-center text-stone-800">{t.resetPasswordTitle}</h2>
            <p className="mt-2 text-center text-gray-500">{t.resetPasswordPrompt}</p>
            <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                  <label htmlFor="new-password">{t.newPasswordLabel}</label>
                  <div className="relative mt-1">
                      <input id="new-password" type={showNewPassword ? 'text' : 'password'} required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>
              </div>
              <div>
                  <label htmlFor="confirm-new-password">{t.confirmPasswordLabel}</label>
                  <div className="relative mt-1">
                      <input id="confirm-new-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                         className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                  </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}

              <button type="submit" disabled={isLoading || !!success} className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700 disabled:bg-gray-400">
                {isLoading ? 'Saving...' : t.saveButton}
              </button>
            </form>
          </div>
        )}
         <button onClick={onClose} className="w-full mt-4 text-sm text-center text-gray-500 hover:text-gray-700">
            {t.backToLogin}
        </button>
      </div>
    </div>
  );
};

export default PasswordResetModal;