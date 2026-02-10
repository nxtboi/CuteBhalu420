
import React, { useState } from 'react';
import { User, LanguageCode } from '../types';
import translations from '../services/translations';
import * as authService from '../services/authService';
import { EyeIcon, EyeOffIcon } from './icons/Icons';

interface ProfilePageProps {
  user: User;
  language: LanguageCode;
  onUserUpdate: (user: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, language, onUserUpdate }) => {
    const t = (translations.profilePage as any)[language];

    const [fullName, setFullName] = useState(user.fullName);
    const [username, setUsername] = useState(user.username);
    const [phone, setPhone] = useState(user.phone || '');
    
    // New Fields
    const [gender, setGender] = useState(user.gender || '');
    const [dob, setDob] = useState(user.dob || '');
    const [address, setAddress] = useState(user.address || '');
    const [district, setDistrict] = useState(user.district || '');
    const [state, setState] = useState(user.state || '');
    const [country, setCountry] = useState(user.country || 'India');
    const [pincode, setPincode] = useState(user.pincode || '');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validation Handlers
    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only alphabets and spaces
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setFullName(value);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and max length 10
        if (/^\d*$/.test(value) && value.length <= 10) {
            setPhone(value);
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only alphabets and spaces
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setDistrict(value);
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only alphabets and spaces
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setState(value);
        }
    };

    const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Allow only numbers and max length 6
        if (/^\d*$/.test(value) && value.length <= 6) {
            setPincode(value);

            // Auto-fetch location details when pincode is 6 digits
            if (value.length === 6) {
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                    const data = await response.json();
                    
                    if (data && data.length > 0 && data[0].Status === 'Success') {
                        const details = data[0].PostOffice[0];
                        setDistrict(details.District);
                        setState(details.State);
                        setCountry(details.Country);
                    }
                } catch (err) {
                    console.error("Failed to fetch pincode details:", err);
                    // Silently fail or let user enter manually
                }
            }
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (newPassword && newPassword !== confirmPassword) {
            setError(t.passwordsDoNotMatchError);
            setIsLoading(false);
            return;
        }

        const updates: Partial<User> = {
            fullName,
            username,
            phone,
            gender,
            dob,
            address,
            district,
            state,
            country,
            pincode,
        };
        
        if (newPassword) {
            updates.password = newPassword;
        }
        
        try {
            const updatedUser = await authService.updateUser(updates);
            onUserUpdate(updatedUser);
            setSuccess(t.updateSuccessMessage);
            setNewPassword('');
            setConfirmPassword('');

        } catch (err: any) {
             setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="p-4 md:p-8 bg-inherit h-full">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-stone-800 mb-6">{t.editProfileTitle}</h1>
            <form onSubmit={handleSaveChanges}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Personal Information</h2>
                    </div>
                    
                    <ProfileInputField label={t.name} id="fullName" value={fullName} onChange={handleFullNameChange} />
                    <ProfileInputField label={t.username} id="username" value={username} onChange={e => setUsername(e.target.value)} />
                    <ProfileInputField label={t.phone} id="phone" value={phone} onChange={handlePhoneChange} type="tel" />
                    
                     <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">{t.gender}</label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm rounded-md bg-white text-gray-900"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">{t.male}</option>
                            <option value="Female">{t.female}</option>
                            <option value="Other">{t.other}</option>
                        </select>
                    </div>

                    <ProfileInputField label={t.dob} id="dob" value={dob} onChange={e => setDob(e.target.value)} type="date" />

                    {/* Address Info */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                         <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Location Details</h2>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <ProfileInputField label={t.address} id="address" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    
                    <ProfileInputField label={t.pincode} id="pincode" value={pincode} onChange={handlePincodeChange} type="text" />
                    <ProfileInputField label={t.district} id="district" value={district} onChange={handleDistrictChange} />
                    <ProfileInputField label={t.state} id="state" value={state} onChange={handleStateChange} />
                    <ProfileInputField label={t.country} id="country" value={country} onChange={e => setCountry(e.target.value)} />
                    
                    {/* Password Section */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">{t.changePasswordTitle}</h2>
                    </div>
                    
                    <ProfileInputField 
                        label={t.newPasswordLabel} 
                        id="newPassword" 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        toggleVisibility={() => setShowNewPassword(!showNewPassword)}
                        isPasswordVisible={showNewPassword}
                    />
                    <ProfileInputField 
                        label={t.confirmNewPasswordLabel} 
                        id="confirmNewPassword" 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                        isPasswordVisible={showConfirmPassword}
                    />
                </div>

                {error && <p className="mt-4 text-sm text-red-600 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                {success && <p className="mt-4 text-sm text-green-600 text-center bg-green-100 p-3 rounded-md">{success}</p>}

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 text-sm font-medium text-white bg-lime-600 border border-transparent rounded-md shadow-sm hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? 'Saving...' : t.saveChangesButton}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

interface ProfileInputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    toggleVisibility?: () => void;
    isPasswordVisible?: boolean;
}

const ProfileInputField: React.FC<ProfileInputFieldProps> = ({ id, label, value, onChange, type = 'text', toggleVisibility, isPasswordVisible }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
            <input
                id={id}
                name={id}
                type={type}
                required={id === 'fullName' || id === 'username'}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
            />
            {toggleVisibility && (
                 <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                    {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            )}
        </div>
    </div>
);

export default ProfilePage;
