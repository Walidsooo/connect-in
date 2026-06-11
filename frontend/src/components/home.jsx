import React, { useRef } from 'react';
import Navbar from '../components/navbar';
import PostList from '../components/postlist';
import CreatePost from '../components/createpost';

const Home = () => {
  const postListRef = useRef();

  const handlePostCreated = (newPost) => {
    if (postListRef.current) {
      postListRef.current.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117]">
      <Navbar />

      <main className="w-full px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-screen-xl mx-auto">
        {/* Colonne Gauche */}
        <div className="hidden md:block col-span-1">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24">
            <h2 className="font-bold text-base text-slate-100 mb-2">Connect'In</h2>
            <p className="text-sm text-slate-500">Partagez vos succès et échangez avec vos collègues de l'ESN.</p>
          </div>
        </div>

        {/* Colonne Centre : Le Fil d'actualité */}
        <div className="col-span-1 md:col-span-3">
          <h1 className="text-xl font-bold text-slate-100 mb-6">Fil d'actualité</h1>

          <CreatePost onPostCreated={handlePostCreated} />

          <PostList ref={postListRef} />
        </div>
      </main>
    </div>
  );
};

export default Home;