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
                {selectedProfile.image ? (
                  <img src={selectedProfile.image} alt={selectedProfile.name} className="profile-image" />
                ) : (
                  selectedProfile.avatar
                )}
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Přidat nový profil</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Jméno *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Zadejte jméno"
              required
            />
          </div>

          <div className="form-group">
            <label>PIN (6 číslic) *</label>
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
              required
            />
          </div>

          <div className="form-group">
            <label>Profilový obrázek</label>
            <div className="image-upload">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="image-upload-btn">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <span>📸 Nahrát obrázek</span>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Barva profilu</label>
            <div className="color-picker">
              {colors.map(color => (
                <div
                  key={color}
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({...formData, color})}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Zrušit
            </button>
            <button type="submit" className="btn btn-primary">
              Vytvořit profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pro editaci profilu
const EditProfileModal = ({ show, profile, onClose, onEdit }) => {
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
    }
  }, [profile]);

  if (!show || !profile) return null;

  const handlePinVerify = (e) => {
    e.preventDefault();
    // Simulace ověření PIN - v reálné aplikaci by se ověřil proti uloženému PIN
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

  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upravit profil - {profile.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        {step === 'pin' ? (
          <form onSubmit={handlePinVerify} className="pin-verify-form">
            <p>Zadejte svůj PIN pro potvrzení</p>
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
              autoFocus
              required
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary">
              Potvrdit
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Jméno</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Nový PIN (ponechte prázdné pro zachování)</label>
              <input
                type="password"
                value={formData.newPin}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                    setFormData({...formData, newPin: e.target.value});
                  }
                }}
                placeholder="••••••"
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label>Profilový obrázek</label>
              <div className="image-upload">
                <input
                  type="file"
                  id="edit-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="edit-image-upload" className="image-upload-btn">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <span>📸 Nahrát obrázek</span>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Barva profilu</label>
              <div className="color-picker">
                {colors.map(color => (
                  <div
                    key={color}
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, color})}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Zrušit
              </button>
              <button type="submit" className="btn btn-primary">
                Uložit změny
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;