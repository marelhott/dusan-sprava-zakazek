import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginScreen = () => {
  const { getProfiles, login } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  const profiles = getProfiles();

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setShowPinInput(true);
    setPin('');
    setError('');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('PIN musí mít 6 číslic');
      return;
    }

    const success = login(selectedProfile.id, pin);
    if (!success) {
      setError('Nesprávný PIN');
      setPin('');
    }
  };

  const handleBackToProfiles = () => {
    setShowPinInput(false);
    setSelectedProfile(null);
    setPin('');
    setError('');
  };

  const handlePinChange = (value) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
      setError('');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        {!showPinInput ? (
          // Výběr profilu
          <div className="profile-selection">
            <div className="login-header">
              <h1>PaintPro</h1>
              <p>Vyberte svůj profil</p>
            </div>
            
            <div className="profiles-grid">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="profile-card"
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div 
                    className="profile-avatar"
                    style={{ backgroundColor: profile.color }}
                  >
                    {profile.avatar}
                  </div>
                  <div className="profile-name">{profile.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // PIN zadání
          <div className="pin-input-section">
            <button 
              className="back-button"
              onClick={handleBackToProfiles}
            >
              ← Zpět
            </button>
            
            <div className="pin-header">
              <div 
                className="selected-avatar"
                style={{ backgroundColor: selectedProfile.color }}
              >
                {selectedProfile.avatar}
              </div>
              <h2>{selectedProfile.name}</h2>
              <p>Zadejte svůj PIN</p>
            </div>

            <form onSubmit={handlePinSubmit} className="pin-form">
              <div className="pin-input-container">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••••"
                  className="pin-input"
                  maxLength="6"
                  autoFocus
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="login-button"
                disabled={pin.length !== 6}
              >
                Přihlásit se
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;