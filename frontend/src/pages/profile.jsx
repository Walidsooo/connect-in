import React, { useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authcontext';
import Navbar from '../components/navbar';
import { userService } from '../services/postservice';
import { storageUrl } from '../utils/storageUrl';

const Profile = () => {
  const { user, setUser, logout } = useAuth();

  // États pour la photo de profil
  const [avatarPreview, setAvatarPreview] = useState(storageUrl(user?.avatar) ?? null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    setAvatarSuccess('');
    setAvatarError('');
    try {
      const data = await userService.uploadAvatar(file);
      setUser(data.user);
      setAvatarPreview(storageUrl(data.avatar));
      setAvatarSuccess('Photo de profil mise à jour !');
    } catch (err) {
      setAvatarError(err.response?.data?.message ?? "Erreur lors de l'upload.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // États pour la modification du profil
  const [profileData, setProfileData] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // États pour la modification du mot de passe
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // État pour la modale de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modifier les infos du profil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const response = await api.put('/user', profileData);
      setUser(response.data.user);
      setProfileSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.message) {
        const messages = Object.values(data).flat().filter(Boolean);
        setProfileError(messages.join(' '));
      } else {
        setProfileError(data?.message ?? 'Erreur lors de la mise à jour du profil.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Modifier le mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.put('/user/password', passwordData);
      setPasswordSuccess('Mot de passe modifié avec succès !');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;
      if (status === 422 && data && typeof data === 'object' && !data.message) {
        const messages = Object.values(data).flat().filter(Boolean);
        setPasswordError(messages.join(' '));
      } else {
        setPasswordError(data?.message ?? 'Erreur lors du changement de mot de passe.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Supprimer le compte
  const handleDeleteAccount = async (option) => {
    try {
      await api.delete('/user', { data: { option } });
      logout();
    } catch (err) {
      console.error("Erreur suppression compte :", err.response?.data);
      alert("Une erreur est survenue lors de la suppression.");
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117]">
      <Navbar />
      <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-4">Mon Profil</h1>

        {/* Section Photo de profil */}
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-5 text-slate-100">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl font-bold overflow-hidden flex-shrink-0 ring-2 ring-indigo-500/30">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user?.prenom?.charAt(0) ?? '?').toUpperCase()
              )}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition text-sm"
              >
                {avatarLoading ? 'Téléchargement...' : 'Changer la photo'}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-slate-600">JPG, PNG ou GIF — max. 2 Mo</p>
              {avatarSuccess && <p className="text-emerald-400 text-sm">{avatarSuccess}</p>}
              {avatarError && <p className="text-red-400 text-sm">{avatarError}</p>}
            </div>
          </div>
        </section>

        {/* Section Infos Personnelles */}
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-5 text-slate-100">Informations personnelles</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Prénom</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  value={profileData.prenom}
                  onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                  value={profileData.nom}
                  onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Email professionnel</label>
                <p className="text-slate-300 p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-sm">{user?.email ?? '—'}</p>
              </div>
            </div>
            {profileSuccess && <p className="text-emerald-400 text-sm">{profileSuccess}</p>}
            {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
            <button
              type="submit"
              disabled={profileLoading}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {profileLoading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </form>
        </section>

        {/* Section Sécurité */}
        <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-5 text-amber-400">Sécurité</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Ancien mot de passe"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            />
            <div className="flex gap-4">
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirmer"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={passwordData.password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              />
            </div>
            {passwordSuccess && <p className="text-emerald-400 text-sm">{passwordSuccess}</p>}
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-amber-500 text-white px-5 py-2 rounded-lg hover:bg-amber-400 disabled:opacity-50 transition"
            >
              {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </section>

        {/* Zone de Danger */}
        <section className="bg-red-950/30 p-6 rounded-xl border border-red-900/50">
          <h2 className="text-lg font-semibold mb-2 text-red-400">Zone de danger</h2>
          <p className="text-sm text-red-500/80 mb-4">La suppression de votre compte est irréversible.</p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm"
          >
            Supprimer mon compte
          </button>
        </section>

        {/* Modale de confirmation suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 p-8 rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-slate-100">Supprimer mon compte</h3>
              <p className="text-sm text-slate-400 mb-6">Cette action est irréversible. Choisissez ce qu'il arrive à votre contenu.</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleDeleteAccount('delete_all')}
                  className="w-full p-4 border border-red-900/60 rounded-xl hover:bg-red-950/40 text-left transition"
                >
                  <span className="font-semibold text-slate-200 block">Supprimer tout mon contenu</span>
                  <span className="text-xs text-slate-500">Supprime tous vos posts et commentaires définitivement.</span>
                </button>
                <button
                  onClick={() => handleDeleteAccount('anonymize')}
                  className="w-full p-4 border border-slate-700 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <span className="font-semibold text-slate-200 block">Garder mon contenu anonymisé</span>
                  <span className="text-xs text-slate-500">Vos posts resteront sous le nom "Utilisateur supprimé".</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full text-slate-500 text-sm py-3 hover:text-slate-300 font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;