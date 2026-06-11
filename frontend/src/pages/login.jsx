import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/authcontext';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
    setApiError(''); // On efface l'erreur API quand l'utilisateur tape à nouveau
  };

  // 2. On ajoute "async" ici car l'appel API est asynchrone
  const handleSubmit = async (e) => {
    e.preventDefault();

    let loginErrors = {};
    if (!credentials.email) loginErrors.email = true;
    if (!credentials.password) loginErrors.password = true;

    if (Object.keys(loginErrors).length > 0) {
      setErrors(loginErrors);
      return;
    }

    // --- DEBUT DE LA PARTIE API ---
    try {
      // On envoie les credentials à l'endpoint de Walid
      const response = await api.post('/login', credentials);
      
      // Le token est dans response.data.token après le login
      const token = response.data.token || response.data.access_token;
      
      // ✅ Stockage du token
      localStorage.setItem('auth_token', token);

      // ✅ Mise à jour du contexte Auth → déclenche authenticated = true immédiatement
      setUser(response.data.user);

      // Redirection vers le feed
      navigate('/feed');
      
      // On déclenche la suite (redirection)
      if (onLoginSuccess) onLoginSuccess();
      
    } catch (err) {
      console.error("Erreur API :", err.response?.data);
      const data = err.response?.data;
      const status = err.response?.status;

      if (status === 401) {
        setApiError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
      } else if (status === 422 && data?.message) {
        setApiError(data.message);
      } else if (status === 429) {
        setApiError("Trop de tentatives de connexion. Veuillez patienter quelques minutes.");
      } else {
        setApiError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
    // --- FIN DE LA PARTIE API ---
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-slate-800 to-gray-900" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-slate-800 px-8 py-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Connect'In</h1>
            <p className="text-slate-400 text-sm mt-2">Réseau social interne de l'ESN</p>
          </div>

          {/* Formulaire */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Connexion</h2>

            {apiError && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                <input
                  type="email"
                  name="email"
                  placeholder="votre.email@entreprise.com"
                  className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 ring-1 ring-red-400'
                      : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                  }`}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-xs text-red-500 mt-1 block">Veuillez saisir votre email</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`block w-full border rounded-lg p-3 text-sm outline-none transition focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 ring-1 ring-red-400'
                      : 'border-gray-300 focus:border-slate-500 focus:ring-slate-200'
                  }`}
                  onChange={handleChange}
                />
                {errors.password && <span className="text-xs text-red-500 mt-1 block">Mot de passe requis</span>}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-700 active:bg-slate-900 transition-colors duration-200"
              >
                Se connecter
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-slate-700 font-semibold hover:text-slate-900 hover:underline">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;