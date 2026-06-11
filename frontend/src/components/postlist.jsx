import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { postService } from '../services/postservice';
import PostItem from './postitem';

const PostList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await postService.getAllPosts({
        search: params.search ?? search,
        sort: params.sort ?? sort,
        page: params.page ?? page,
      });
      setPosts(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (error) {
      console.error("Erreur lors de la récupération des posts", error);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => {
    fetchPosts();
  }, [search, sort, page]);

  useImperativeHandle(ref, () => ({
    refresh: () => fetchPosts({ page: 1 }),
  }));

  // Chercher (déclenché à la soumission)
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  // Changer le tri
  const handleSort = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePostUpdated = (postId, updatedPost) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: updatedPost.content } : p));
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher une publication..."
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 transition-colors"
        >
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            className="px-4 py-2 rounded-lg text-sm border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            Effacer
          </button>
        )}
      </form>

      {/* Boutons de tri */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleSort('date')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            sort === 'date'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Plus récents
        </button>
        <button
          onClick={() => handleSort('popular')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            sort === 'popular'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          }`}
        >
          Populaires
        </button>
        {total > 0 && (
          <span className="ml-auto text-xs text-slate-600 self-center">{total} publication{total > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Liste des posts */}
      {loading ? (
        <p className="text-center mt-10 text-slate-500">Chargement du flux...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-slate-500 mt-10">
          {search ? `Aucun résultat pour "«${search}»".` : 'Aucun post pour le moment. Soyez le premier à publier !'}
        </p>
      ) : (
        <div className="space-y-4 p-1">
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 pb-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-sm text-slate-500">
            Page {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
});

export default PostList;
