import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginScreen = () => {
  const { getProfiles, login, addProfile, editProfile } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  const profiles = getProfiles();

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setShowPinInput(true);
    setPin('');
    setError('');
  };

  const handleProfileEdit = (profile) => {
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('PIN musí mít 6 číslic');
      return;
    }

    console.log('🔐 LoginScreen odesílá PIN:', pin, 'typ:', typeof pin);
    
    // Opraveno: login() nyní očekává jen PIN, ne (profileId, pin)
    const success = login(pin);
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
                <div key={profile.id} className="profile-card-container">
                  <div
                    className="profile-card"
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div 
                      className="profile-avatar"
                      style={{ backgroundColor: profile.color }}
                    >
                      {profile.image ? (
                        <img src={profile.image} alt={profile.name} className="profile-image" />
                      ) : (
                        profile.avatar
                      )}
                    </div>
                    <div className="profile-name">{profile.name}</div>
                  </div>
                  <button 
                    className="edit-profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfileEdit(profile);
                    }}
                    title="Upravit profil"
                  >
                    ⚙️
                  </button>
                </div>
              ))}
              
              {/* Tlačítko přidat profil */}
              <div className="profile-card add-profile" onClick={() => setShowAddModal(true)}>
                <div className="profile-avatar add-avatar">
                  <span className="add-icon">+</span>
                </div>
                <div className="profile-name">Přidat profil</div>
              </div>
            </div>
          </div>
        ) : (
          // PIN zadání
          <div className="pin-screen-container">
            <button 
              className="back-button-enhanced"
              onClick={handleBackToProfiles}
            >
              <span className="back-icon">←</span>
              <span>Zpět na profily</span>
            </button>
            
            <div className="pin-main-card">
              {/* Avatar Section */}
              <div className="pin-avatar-section">
                <div className="pin-avatar-ring">
                  <div 
                    className="pin-selected-avatar"
                    style={{ backgroundColor: selectedProfile.color }}
                  >
                    {selectedProfile.image ? (
                      <img src={selectedProfile.image} alt={selectedProfile.name} className="pin-avatar-image" />
                    ) : (
                      <span className="pin-avatar-text">{selectedProfile.avatar}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="pin-welcome-section">
                <h1 className="pin-welcome-title">Vítejte zpět!</h1>
                <h2 className="pin-user-name">{selectedProfile.name}</h2>
                <p className="pin-instruction">Zadejte svůj 6-místný PIN kód pro pokračování</p>
              </div>

              {/* PIN Input Section */}
              <form onSubmit={handlePinSubmit} className="pin-form-enhanced">
                <div className="pin-input-row">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="pin-digit-container">
                      <input
                        type="password"
                        value={pin[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d?$/.test(value)) {
                            const newPin = pin.split('');
                            newPin[index] = value;
                            handlePinChange(newPin.join(''));
                            
                            // Auto focus next input
                            if (value && index < 5) {
                              const nextInput = e.target.parentElement.parentElement.children[index + 1]?.querySelector('input');
                              if (nextInput) nextInput.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace
                          if (e.key === 'Backspace' && !pin[index] && index > 0) {
                            const prevInput = e.target.parentElement.parentElement.children[index - 1]?.querySelector('input');
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        className="pin-digit-input"
                        maxLength="1"
                        autoFocus={index === 0}
                      />
                      <div className="pin-digit-indicator"></div>
                    </div>
                  ))}
                </div>
                
                {error && (
                  <div className="pin-error-card">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{error}</span>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="pin-login-button"
                  disabled={pin.length !== 6}
                >
                  <span className="login-text">Přihlásit se</span>
                  <span className="login-arrow">→</span>
                </button>
              </form>

              {/* Security Note */}
              <div className="pin-security-note">
                <span className="security-icon">🔒</span>
                <span>Vaše data jsou chráněna end-to-end šifrováním</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Profile Modal */}
      <AddProfileModal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onAdd={addProfile}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal 
        show={showEditModal} 
        profile={editingProfile}
        onClose={() => {
          setShowEditModal(false);
          setEditingProfile(null);
        }}
        onEdit={editProfile}
      />
    </div>
  );
};

// Modal pro přidání profilu
const AddProfileModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    color: '#4F46E5',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  if (!show) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData({ ...formData, image: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.pin.length === 6) {
      onAdd(formData);
      setFormData({ name: '', pin: '', color: '#4F46E5', image: null });
      setImagePreview(null);
      onClose();
    }
  };

  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="add-modal-overlay" onClick={onClose}>
      <div className="add-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="add-modal-header">
          <div className="add-modal-title">
            <div className="add-modal-icon">
              <span>👤</span>
              <div className="icon-plus">+</div>
            </div>
            <div>
              <h2>Nový profil</h2>
              <p>Vytvořte si vlastní účet</p>
            </div>
          </div>
          <button className="add-modal-close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
        
        <div className="add-modal-content">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <div className="add-section">
              <div className="add-section-header">
                <h3>📝 Základní informace</h3>
                <div className="section-line"></div>
              </div>
              
              <div className="add-form-group">
                <label>Jméno profilu</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Zadejte své jméno"
                    className="add-input"
                    required
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>

              <div className="add-form-group">
                <label>Bezpečnostní PIN (6 číslic)</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={e => {
                      if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                        setFormData({...formData, pin: e.target.value});
                      }
                    }}
                    placeholder="••••••"
                    maxLength="6"
                    className="add-input pin-input"
                    required
                  />
                  <div className="input-focus-line"></div>
                  <div className="pin-strength">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`pin-dot ${i < formData.pin.length ? 'filled' : ''}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="add-section">
              <div className="add-section-header">
                <h3>🖼️ Profilový obrázek</h3>
                <div className="section-line"></div>
              </div>
              
              <div className="add-avatar-section">
                <input
                  type="file"
                  id="add-avatar-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="add-avatar-upload" className="add-avatar-upload">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="add-avatar-preview" />
                  ) : (
                    <div className="add-avatar-placeholder">
                      <div className="upload-circle">
                        <span className="upload-icon">📷</span>
                      </div>
                      <span className="upload-text">Klikněte pro nahrání</span>
                      <span className="upload-subtitle">nebo přetáhněte obrázek</span>
                    </div>
                  )}
                  <div className="add-avatar-overlay">
                    <span>📸</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Color Section */}
            <div className="add-section">
              <div className="add-section-header">
                <h3>🎨 Barva profilu</h3>
                <div className="section-line"></div>
              </div>
              
              <div className="add-color-grid">
                {colors.map((color, index) => (
                  <div
                    key={color}
                    className={`add-color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, color})}
                  >
                    <div className="color-inner">
                      {formData.color === color && (
                        <span className="color-check">✓</span>
                      )}
                    </div>
                    <div className="color-ripple"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="add-section preview-section">
              <div className="add-section-header">
                <h3>👀 Náhled profilu</h3>
                <div className="section-line"></div>
              </div>
              
              <div className="profile-preview">
                <div 
                  className="preview-avatar"
                  style={{ backgroundColor: formData.color }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" />
                  ) : (
                    <span>{formData.name ? formData.name.charAt(0).toUpperCase() : '?'}</span>
                  )}
                </div>
                <div className="preview-info">
                  <div className="preview-name">{formData.name || 'Jméno profilu'}</div>
                  <div className="preview-status">
                    {formData.pin.length === 6 ? '🔐 PIN nastaven' : '🔓 PIN nenastaven'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="add-modal-actions">
              <button type="button" className="add-cancel-button" onClick={onClose}>
                <span>Zrušit</span>
              </button>
              <button 
                type="submit" 
                className="add-create-button"
                disabled={!formData.name || formData.pin.length !== 6}
              >
                <span>Vytvořit profil</span>
                <span>✨</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal pro editaci profilu
const EditProfileModal = ({ show, profile, onClose, onEdit }) => {
  const { deleteProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    pin: '',
    newPin: '',
    color: '#4F46E5',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [step, setStep] = useState('pin'); // 'pin' nebo 'edit'
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        pin: '',
        newPin: '',
        color: profile.color,
        image: profile.image
      });
      setImagePreview(profile.image);
      setStep('pin');
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [profile]);

  if (!show || !profile) return null;

  const handlePinVerify = (e) => {
    e.preventDefault();
    setStep('edit');
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFormData({ ...formData, image: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onEdit(profile.id, formData.pin, {
      name: formData.name,
      pin: formData.newPin || formData.pin,
      color: formData.color,
      image: formData.image
    });
    
    if (success) {
      onClose();
    } else {
      setError('Nesprávný PIN');
    }
  };

  const handleDeleteProfile = () => {
    if (window.confirm('Opravdu chcete smazat tento profil? Tato akce je nevratná a smažete všechna data včetně zakázek.')) {
      const success = deleteProfile(profile.id, formData.pin);
      if (success) {
        onClose();
      } else {
        setError('Nesprávný PIN nebo nemůžete smazat poslední profil');
      }
    }
  };

  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-modal-header">
          <div className="edit-modal-title">
            <div className="edit-modal-icon">
              <span>👤</span>
            </div>
            <div>
              <h2>Upravit profil</h2>
              <p>{profile.name}</p>
            </div>
          </div>
          <button className="edit-modal-close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
        
        {step === 'pin' ? (
          <div className="edit-modal-content">
            <div className="pin-verification-section">
              <div className="pin-verification-icon">
                <span>🔐</span>
              </div>
              <h3>Ověření identity</h3>
              <p>Pro pokračování zadejte svůj PIN kód</p>
              
              <form onSubmit={handlePinVerify}>
                <div className="pin-input-group">
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={e => {
                      if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                        setFormData({...formData, pin: e.target.value});
                        setError('');
                      }
                    }}
                    placeholder="••••••"
                    maxLength="6"
                    className="pin-verification-input"
                    autoFocus
                    required
                  />
                </div>
                
                {error && (
                  <div className="edit-error-message">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}
                
                <button type="submit" className="pin-verify-button">
                  <span>Potvrdit PIN</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="edit-modal-content">
            <form onSubmit={handleSubmit}>
              {/* Profile Section */}
              <div className="edit-section">
                <div className="section-header">
                  <h3>Základní informace</h3>
                  <span className="section-icon">📝</span>
                </div>
                
                <div className="edit-form-group">
                  <label>Jméno</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="edit-input"
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label>Nový PIN (volitelné)</label>
                  <input
                    type="password"
                    value={formData.newPin}
                    onChange={e => {
                      if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                        setFormData({...formData, newPin: e.target.value});
                      }
                    }}
                    placeholder="Ponechte prázdné pro zachování"
                    maxLength="6"
                    className="edit-input"
                  />
                </div>
              </div>

              {/* Avatar Section */}
              <div className="edit-section">
                <div className="section-header">
                  <h3>Profilový obrázek</h3>
                  <span className="section-icon">🖼️</span>
                </div>
                
                <div className="avatar-upload-section">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-area">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="avatar-preview" />
                    ) : (
                      <div className="avatar-upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Nahrát obrázek</span>
                      </div>
                    )}
                    <div className="avatar-upload-overlay">
                      <span>📸</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Color Section */}
              <div className="edit-section">
                <div className="section-header">
                  <h3>Barva profilu</h3>
                  <span className="section-icon">🎨</span>
                </div>
                
                <div className="color-selection">
                  {colors.map(color => (
                    <div
                      key={color}
                      className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({...formData, color})}
                    >
                      {formData.color === color && <span>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="edit-section danger-section">
                <div className="section-header">
                  <h3>Nebezpečná zóna</h3>
                  <span className="section-icon">⚠️</span>
                </div>
                
                <div className="danger-content">
                  <p>Smazání profilu je nevratné a odstraní všechny zakázky a data tohoto uživatele.</p>
                  <button 
                    type="button" 
                    className="delete-profile-button"
                    onClick={handleDeleteProfile}
                  >
                    <span>🗑️</span>
                    Smazat profil
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="edit-modal-actions">
                <button type="button" className="cancel-button" onClick={onClose}>
                  Zrušit
                </button>
                <button type="submit" className="save-button">
                  <span>Uložit změny</span>
                  <span>✓</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;