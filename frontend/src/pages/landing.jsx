import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const phrases = [
  'Échangez avec vos collègues.',
  'Partagez vos succès.',
  'Restez connectés à l\'équipe.',
  'Construisez votre réseau interne.',
];

const Landing = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    const phrase = phrases[currentPhrase];

    if (typing) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, displayed.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 25);
      } else {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, typing, currentPhrase]);

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-slate-700">
        <span className="text-2xl font-bold text-white tracking-tight">Connect'In</span>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:bg-slate-700"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="bg-white text-slate-900 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Le réseau social
            <br />
            <span className="text-slate-400">de votre ESN</span>
          </h1>

          {/* Texte animé */}
          <div className="h-10 mb-10">
            <p className="text-xl text-slate-300 font-light">
              {displayed}
              <span className="inline-block w-0.5 h-5 bg-slate-300 ml-0.5 animate-pulse" />
            </p>
          </div>

          <p className="text-slate-400 text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Connect'In est la plateforme interne dédiée à votre équipe. Publiez, commentez et restez informés de la vie de l'entreprise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-slate-900 font-semibold px-8 py-4 rounded-xl hover:bg-slate-100 transition-colors text-base"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="border border-slate-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors text-base"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full border-t border-slate-700 py-16 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Échangez</h3>
            <p className="text-slate-400 text-sm">Commentez les publications de vos collègues en temps réel.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Partagez</h3>
            <p className="text-slate-400 text-sm">Publiez vos actualités, succès et annonces importantes.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Connectez-vous</h3>
            <p className="text-slate-400 text-sm">Rejoignez la communauté interne et développez votre réseau.</p>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-slate-600 text-xs border-t border-slate-800">
        Connect'In — Réseau interne ESN
      </footer>
    </div>
  );
};

export default Landing;
