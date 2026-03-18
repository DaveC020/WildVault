import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Mail, LogOut, Edit, UserRound, KeyRound, Hash, Camera } from 'lucide-react';
import PropTypes from 'prop-types';
import {
  fetchUserProfilePhoto,
  fetchUserProfile,
  getAuthToken,
  getInitials,
  uploadUserProfilePhoto,
  validateProfileImageFile,
  updateUserPassword,
  updateUserProfile,
} from '../../api/authApi';
import './profile.css';

export function ProfilePage({ user = {}, onLogout, onProfileUpdated }) {
  const resolvedFirstName = user.firstName || '';
  const resolvedLastName = user.lastName || '';
  const resolvedFullName = [resolvedFirstName, resolvedLastName].filter(Boolean).join(' ').trim() || user.fullName || user.name || user.username || user.email || 'User';

  const currentUser = {
    id: user.id || null,
    studentId: user.studentId || null,
    department: user.department || '',
    username: user.username || user.email || '',
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    fullName: resolvedFullName,
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
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [formState, setFormState] = useState({
    studentId: '',
    department: '',
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Update displayed avatar when user prop changes
  useEffect(() => {
    setDisplayedAvatarUrl(user.avatarUrl || null);
    setAvatarLoadFailed(false);
  }, [user.avatarUrl]);

  const resolveAvatarSrc = (source) => {
    if (!source || typeof source !== 'string') {
      return null;
    }

    const trimmed = source.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }

    return `${trimmed}${trimmed.includes('?') ? '&' : '?'}t=${Date.now()}`;
  };

  const avatarImageSrc = resolveAvatarSrc(displayedAvatarUrl);

  const openModal = () => {
    setSaveError('');
    setSaveSuccess('');
    setFormState({
      studentId: currentUser.studentId ? String(currentUser.studentId) : 'N/A',
      department: currentUser.department || 'N/A',
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      currentPassword: '',
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
    const emailChanged = formState.email.trim().toLowerCase() !== (currentUser.email || '').trim().toLowerCase();
    const passwordEntered = formState.currentPassword.trim() || formState.newPassword.trim() || formState.confirmNewPassword.trim();
    return emailChanged || Boolean(passwordEntered);
  }, [currentUser.email, formState.confirmNewPassword, formState.currentPassword, formState.email, formState.newPassword]);

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

    const validation = validateProfileImageFile(file);
    if (!validation.valid) {
      setSaveError(validation.message);
      setSaveSuccess('');
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
      const uploadResult = await uploadUserProfilePhoto(token, file);
      const profile = await fetchUserProfile(token);
      const profilePhoto = await fetchUserProfilePhoto(token, { forceRefresh: true }).catch(() => null);
      const localPreviewUrl = URL.createObjectURL(file);
      
      const updatedFields = {
        photoUrl: uploadResult?.fileUrl || profilePhoto || profile?.photoUrl || localPreviewUrl,
      };
      
      // Update local state immediately to show new photo
      setDisplayedAvatarUrl(updatedFields.photoUrl);
      setAvatarLoadFailed(false);
      
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

    const nextEmail = formState.email.trim();
    const currentEmail = (currentUser.email || '').trim();
    const emailChanged = nextEmail.toLowerCase() !== currentEmail.toLowerCase();
    const hasCurrentPassword = Boolean(formState.currentPassword.trim());
    const hasNewPassword = Boolean(formState.newPassword.trim());
    const hasConfirmPassword = Boolean(formState.confirmNewPassword.trim());
    const anyPasswordFieldProvided = hasCurrentPassword || hasNewPassword || hasConfirmPassword;
    const shouldUpdatePassword = hasCurrentPassword && hasNewPassword && hasConfirmPassword;

    if (!nextEmail) {
      setSaveError('Email is required.');
      return;
    }

    if (anyPasswordFieldProvided && !shouldUpdatePassword) {
      setSaveError('To change password, fill in Current Password, New Password, and Confirm New Password.');
      return;
    }

    if (shouldUpdatePassword && formState.newPassword !== formState.confirmNewPassword) {
      setSaveError('New password and confirm password do not match.');
      return;
    }

    if (!isFormDirty) {
      setSaveError('No changes detected.');
      return;
    }

    setIsSaving(true);
    try {
      let updatedEmail = currentEmail;

      if (shouldUpdatePassword) {
        await updateUserPassword(token, {
          currentPassword: formState.currentPassword,
          newPassword: formState.newPassword,
          confirmPassword: formState.confirmNewPassword,
        });
      }

      if (emailChanged) {
        const profileResult = await updateUserProfile(token, {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: nextEmail,
          studentId: currentUser.studentId,
        });
        updatedEmail = profileResult?.user?.email || nextEmail;
      }

      onProfileUpdated?.({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        fullName: currentUser.fullName,
        email: updatedEmail,
        studentId: currentUser.studentId,
      });

      setSaveSuccess('Credentials updated successfully.');
      setFormState((prev) => ({
        ...prev,
        email: updatedEmail,
        currentPassword: '',
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
            {avatarImageSrc && !avatarLoadFailed ? (
              <img
                src={avatarImageSrc}
                alt="Avatar"
                className="profile-avatar-img"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <span className="profile-avatar-fallback">
                {avatarInitials}
              </span>
            )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={handlePhotoFileChange}
          className="profile-hidden-file-input"
        />

        <div className="profile-header-content">
          <div className="profile-info">
            <h1 className="profile-name">{currentUser.fullName}</h1>
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
            <button
              type="button"
              className="profile-change-photo-btn"
              onClick={handleChangeProfileClick}
              disabled={isUploadingPhoto}
            >
              <Camera size={16} />
              {isUploadingPhoto ? 'Uploading...' : 'Change Profile'}
            </button>
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
                <span className="profile-modal-label">First Name</span>
                <div className="profile-modal-input-wrap disabled">
                  <UserRound size={16} />
                  <input name="firstName" value={formState.firstName} disabled readOnly />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Last Name</span>
                <div className="profile-modal-input-wrap disabled">
                  <UserRound size={16} />
                  <input name="lastName" value={formState.lastName} disabled readOnly />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Department</span>
                <div className="profile-modal-input-wrap disabled">
                  <Hash size={16} />
                  <input name="department" value={formState.department} disabled readOnly />
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
                <span className="profile-modal-label">Email</span>
                <div className="profile-modal-input-wrap">
                  <Mail size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                    required
                  />
                </div>
              </label>

              <label className="profile-modal-field">
                <span className="profile-modal-label">Current Password</span>
                <div className="profile-modal-input-wrap">
                  <KeyRound size={16} />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formState.currentPassword}
                    onChange={handleFieldChange}
                    disabled={isSaving}
                    placeholder="Enter current password"
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
                <span className="profile-modal-label">Confirm Password</span>
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
    department: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    fullName: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  onLogout: PropTypes.func,
  onProfileUpdated: PropTypes.func,
};
