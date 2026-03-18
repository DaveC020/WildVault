import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Mail, LogOut, Edit, UserRound, KeyRound, Hash, Camera } from 'lucide-react';
import PropTypes from 'prop-types';
import {
  fetchUserProfilePhoto,
  fetchUserProfile,
  getAuthToken,
  getInitials,
  uploadUserProfilePhoto,
  updateUserPassword,
  updateUserProfile,
} from '../../api/authApi';
import './profile.css';

export function ProfilePage({ user = {}, onLogout, onProfileUpdated }) {
  const currentUser = {
    id: user.id || null,
    studentId: user.studentId || null,
    username: user.username || user.email || '',
    fullName: user.fullName || user.name || user.username || user.email || 'User',
    displayName: user.displayName || user.fullName || user.name || user.username || user.email || 'User',
    email: user.email || 'alis.go@cit.edu',
    avatarUrl: user.avatarUrl || null,
  };
  const avatarInitials = getInitials(currentUser.fullName);
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [displayedAvatarUrl, setDisplayedAvatarUrl] = useState(user.avatarUrl || null);
  const [formState, setFormState] = useState({
    studentId: '',
    fullName: '',
    email: '',
    displayName: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Update displayed avatar when user prop changes
  useEffect(() => {
    setDisplayedAvatarUrl(user.avatarUrl || null);
  }, [user.avatarUrl]);

  const openModal = () => {
    setSaveError('');
    setSaveSuccess('');
    setFormState({
      studentId: currentUser.studentId ? String(currentUser.studentId) : 'N/A',
      fullName: currentUser.fullName,
      email: currentUser.email,
      displayName: currentUser.displayName || '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }
    setIsModalOpen(false);
  };

  const isFormDirty = useMemo(() => {
    const displayNameChanged = formState.displayName.trim() !== (currentUser.displayName || '').trim();
    const passwordEntered = formState.newPassword.trim() || formState.confirmNewPassword.trim();
    return displayNameChanged || Boolean(passwordEntered);
  }, [currentUser.displayName, formState.confirmNewPassword, formState.displayName, formState.newPassword]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeProfileClick = () => {
    if (isUploadingPhoto) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSaveError('Session expired. Please log in again.');
      return;
    }

    setSaveError('');
    setSaveSuccess('');
    setIsUploadingPhoto(true);

    try {
      await uploadUserProfilePhoto(token, file);
      const profile = await fetchUserProfile(token);
      const profilePhoto = await fetchUserProfilePhoto(token).catch(() => null);
      
      const updatedFields = {
        photoUrl: profilePhoto || profile?.photoUrl || null,
      };
      
      // Update local state immediately to show new photo
      setDisplayedAvatarUrl(updatedFields.photoUrl);
      
      // Notify parent to update app state
      onProfileUpdated?.(updatedFields);
      
      setSaveSuccess('Profile photo updated successfully.');
    } catch (error) {
      setSaveError(error?.message || 'Unable to update profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    const token = getAuthToken();
    if (!token) {
      setSaveError('Session expired. Please log in again.');
      return;
    }

    const nextDisplayName = formState.displayName.trim();
    const currentDisplayName = (currentUser.displayName || '').trim();
    const displayNameChanged = nextDisplayName !== currentDisplayName;
    const passwordProvided = Boolean(formState.newPassword.trim() || formState.confirmNewPassword.trim());

    if (!nextDisplayName) {
      setSaveError('Display name is required.');
      return;
    }

    if (passwordProvided && formState.newPassword !== formState.confirmNewPassword) {
      setSaveError('New password and confirm password do not match.');
      return;
    }

    if (!isFormDirty) {
      setSaveError('No changes detected.');
      return;
    }

    setIsSaving(true);
    try {
      let updatedDisplayName = currentDisplayName;

      if (passwordProvided) {
        await updateUserPassword(token, {
          newPassword: formState.newPassword,
          confirmPassword: formState.confirmNewPassword,
        });
      }

      if (displayNameChanged) {
        const profileResult = await updateUserProfile(token, {
          displayName: nextDisplayName,
        });
        updatedDisplayName = profileResult?.user?.displayName || nextDisplayName;
      }

      onProfileUpdated?.({
        displayName: updatedDisplayName,
        fullName: currentUser.fullName,
        studentId: currentUser.studentId,
      });

      setSaveSuccess('Credentials updated successfully.');
      setFormState((prev) => ({
        ...prev,
        displayName: updatedDisplayName,
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (error) {
      setSaveError(error?.message || 'Unable to update credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="profile-cover">
          <div className="profile-cover-pattern" />
        </div>
        
        <div className="profile-avatar-wrapper">
            {displayedAvatarUrl ? (
              <img src={displayedAvatarUrl} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-fallback">
                {avatarInitials}
              </span>
            )}
        </div>

        <button
          type="button"
          className="profile-change-photo-btn"
          onClick={handleChangeProfileClick}
          disabled={isUploadingPhoto}
        >
          <Camera size={16} />
          {isUploadingPhoto ? 'Uploading...' : 'Change Profile'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={handlePhotoFileChange}
          className="profile-hidden-file-input"
        />

        <div className="profile-header-content">
          <div className="profile-info">
            <h1 className="profile-name">{currentUser.displayName}</h1>
            <div className="profile-badges">
              <div className="profile-badge">
                <Mail size={16} className="profile-badge-icon" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.studentId && (
                <div className="profile-badge">
                  <Hash size={16} className="profile-badge-icon" />
                  <span>{currentUser.studentId}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-actions">
            <button onClick={openModal} className="profile-btn outline" type="button">
              <Edit size={16} />
              Modify Profile
            </button>
            <button onClick={onLogout} className="profile-btn ghost" type="button">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <dialog className="profile-modal-backdrop" open aria-label="Modify profile credentials">
          <form className="profile-modal-card" onSubmit={handleSave}>
            <div className="profile-modal-grid">
              <label className="profile-modal-field">
                <span className="profile-modal-label">Full Legal Name</span>
                <div className="profile-modal-input-wrap disabled">
                  <UserRound size={16} />
                  <input name="fullName" value={formState.fullName} disabled readOnly />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Institutional Email</span>
                <div className="profile-modal-input-wrap disabled">
                  <Mail size={16} />
                  <input name="email" value={formState.email} disabled readOnly />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Student ID</span>
                <div className="profile-modal-input-wrap disabled">
                  <Hash size={16} />
                  <input name="studentId" value={formState.studentId} disabled readOnly />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Display Name</span>
                <div className="profile-modal-input-wrap">
                  <UserRound size={16} />
                  <input
                    name="displayName"
                    value={formState.displayName}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">New Password</span>
                <div className="profile-modal-input-wrap">
                  <KeyRound size={16} />
                  <input
                    type="password"
                    name="newPassword"
                    value={formState.newPassword}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                    placeholder="Enter new password"
                  />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Confirm New Password</span>
                <div className="profile-modal-input-wrap">
                  <KeyRound size={16} />
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formState.confirmNewPassword}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                    placeholder="Confirm new password"
                  />
                </div>
              </label>
            </div>

            {saveError && <p className="profile-modal-error">{saveError}</p>}
            {saveSuccess && <p className="profile-modal-success">{saveSuccess}</p>}

            <div className="profile-modal-actions">
              <button type="submit" className="profile-modal-btn primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update Credentials'}
              </button>
              <button type="button" className="profile-modal-btn secondary" onClick={closeModal} disabled={isSaving}>
                Discard Changes
              </button>
            </div>
          </form>
        </dialog>
      )}

    </div>
  );
}

ProfilePage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    studentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    username: PropTypes.string,
    fullName: PropTypes.string,
    displayName: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  onLogout: PropTypes.func,
  onProfileUpdated: PropTypes.func,
};
