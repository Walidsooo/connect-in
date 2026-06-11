import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authcontext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  // État pour afficher les erreurs retournées par le serveur (ex: email déjà pris)
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    let clientError = '';

    if (!formData.firstName) newErrors.firstName = true;
    if (!formData.lastName) newErrors.lastName = true;
    if (!formData.role) newErrors.role = true;
    if (!formData.email) {
      newErrors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true;
      clientError = "L'adresse email n'est pas valide.";
    } else if (!formData.email.toLowerCase().endsWith('@entreprise-esn.com')) {
      newErrors.email = true;
      clientError = "L'email doit appartenir au domaine @entreprise-esn.com (ex: prenom.nom@entreprise-esn.com).";
    }
    if (!formData.password) {
      newErrors.password = true;
    } else if (formData.password.length < 8) {
      newErrors.password = true;
      clientError = clientError || 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (clientError) setApiError(clientError);
      return;
    }

    // --- DEBUT DE LA LOGIQUE API ---
    try {
      // On adapte les noms de champs selon ce qu'attend Laravel (nom/prenom)
      const response = await api.post('/register', {
        nom: formData.lastName,
        prenom: formData.firstName,
        role: formData.role,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password, // Requis par Laravel
      });
      
      // Le token est dans access_token après l'inscription
      const token = response.data.access_token || response.data.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      // ✅ Mise à jour du contexte Auth → authenticated = true immédiatement
      setUser(response.data.user);

      // Redirection vers le feed
      navigate('/feed');
      
    } catch (err) {
      const data = err.response?.data;

      if (!data) {
        setApiError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
        return;
      }

      // Laravel renvoie soit { champ: ["message"] } soit { message: "..." }
      if (data.message && typeof data.message === 'string') {
        setApiError(data.message);
      } else if (typeof data === 'object') {
        // { "email": ["L'email doit..."], "nom": ["..."] }
        const messages = Object.values(data)
          .flat()
          .filter(msg => typeof msg === 'string' && msg.length > 0);
        setApiError(messages.length > 0 ? messages[0] : "Une erreur est survenue lors de l'inscription.");
      } else if (typeof data === 'string') {
        setApiError(data);
      } else {
        setApiError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    }
    // --- FIN DE LA LOGIQUE API ---
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 py-8">
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-900" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-slate-800 px-8 py-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Connect'In</h1>
            <p className="text-slate-400 text-sm mt-2">Rejoindre le réseau de l'ESN</p>
          </div>

          {/* Formulaire */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Créer un compte</h2>

            {apiError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                      errors.firstName ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                    }`}
                    onChange={handleChange}
                  />
                  {errors.firstName && <span className="text-xs text-red-500 mt-1 block">Requis</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                      errors.lastName ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                    }`}
                    onChange={handleChange}
                  />
                  {errors.lastName && <span className="text-xs text-red-500 mt-1 block">Requis</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle dans l'ESN</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 bg-white ${
                    errors.role ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                  }`}
                >
                  <option value="">-- Sélectionnez votre rôle --</option>
                  <option value="developer">Développeur</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                  <option value="devops">DevOps</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Autre</option>
                </select>
                {errors.role && <span className="text-xs text-red-500 mt-1 block">Le rôle est requis</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                <input
                  type="email"
                  name="email"
                  placeholder="votre.email@entreprise.com"
                  className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                    errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                  }`}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-xs text-red-500 mt-1 block">Email obligatoire</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                    errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                  }`}
                  onChange={handleChange}
                />
                {errors.password && <span className="text-xs text-red-500 mt-1 block">Mot de passe requis</span>}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-700 active:bg-slate-900 transition-colors duration-200"
              >
                Créer mon compte
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-slate-700 font-semibold hover:text-slate-900 hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;