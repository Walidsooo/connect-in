import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-slate-800 sticky top-0 z-50">
      <div className="w-full px-6 md:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo Connect'In */}
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-white tracking-tight hover:text-slate-300 transition-colors"
          >
            Connect'In
          </button>

          {/* Liens de navigation */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400 hidden sm:block">Bonjour, {user?.prenom}</span>
            <button
              onClick={() => navigate('/feed')}
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Fil d'actualité
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Mon Profil
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800 hover:text-white transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;