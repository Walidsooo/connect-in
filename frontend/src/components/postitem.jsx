import React, { useState } from 'react';
import { postService } from '../services/postservice';
import CommentSection from './commentsection';
import { useAuth } from '../context/authcontext';
import { storageUrl } from '../utils/storageUrl';

const PostItem = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();

  const authorName = post.author ? post.author.name : "Utilisateur supprimé";
  const authorInitial = post.author ? post.author.name.charAt(0).toUpperCase() : "?";
  const authorRole = post.author?.role ?? null;
  const authorAvatar = storageUrl(post.author?.avatar ?? null);
  const isOwner = user && post.author && user.id === post.author.id;

  // Correspondance rôle → libellé + couleur badge (dark)
  const roleLabels = {
    developer: { label: 'Développeur', color: 'bg-blue-500/15 text-blue-400' },
    designer: { label: 'Designer', color: 'bg-pink-500/15 text-pink-400' },
    manager: { label: 'Manager', color: 'bg-amber-500/15 text-amber-400' },
    devops: { label: 'DevOps', color: 'bg-emerald-500/15 text-emerald-400' },
    consultant: { label: 'Consultant', color: 'bg-violet-500/15 text-violet-400' },
    other: { label: 'Autre', color: 'bg-slate-500/20 text-slate-400' },
  };

  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [isLiked, setIsLiked] = useState(post.is_liked ?? false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length ?? 0);

  // États pour la modification du post
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);

  // Like / Unlike
  const handleLike = async () => {
    const previousIsLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const data = await postService.toggleLike(post.id);
      setLikesCount(data.likes_count);
      setIsLiked(data.is_liked);
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousCount);
      console.error("Erreur lors du like :", error);
    }
  };

  // Modifier le post
  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      const data = await postService.updatePost(post.id, editContent);
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated(post.id, data.post);
    } catch (error) {
      console.error("Erreur modification post :", error);
    } finally {
      setEditLoading(false);
    }
  };

  // Supprimer le post
  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce post ?")) return;
    try {
      await postService.deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (error) {
      console.error("Erreur suppression post :", error);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors mb-4 max-w-2xl mx-auto">

      {/* En-tête : auteur + actions propriétaire */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mr-3 overflow-hidden flex-shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorInitial
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{authorName}</h3>
            {authorRole && roleLabels[authorRole] && (
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${roleLabels[authorRole].color}`}>
                {roleLabels[authorRole].label}
              </span>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              Publié le {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Boutons modifier / supprimer */}
        {isOwner && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-400 font-medium px-3 py-1 rounded-lg border border-red-900/50 hover:bg-red-500/10 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Contenu du post (ou formulaire d'édition) */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={2000}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdate}
              disabled={editLoading}
              className="bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {editLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditContent(post.content); }}
              className="text-slate-400 px-4 py-1 rounded-lg text-sm hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="text-slate-300 text-base mb-4 whitespace-pre-wrap leading-relaxed">
          {editContent}
        </div>
      )}

      {post.image_url && (
        <img
          src={storageUrl(post.image_url)}
          alt="Illustration du post"
          className="rounded-lg w-full object-cover max-h-96 mb-4"
        />
      )}

      {/* Zone Like / Commentaires */}
      <div className="flex items-center gap-5 border-t border-slate-800 pt-3 mt-3 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 font-medium transition-colors px-3 py-1.5 rounded-lg ${
            isLiked
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
          }`}
        >
          <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount} J'aime{likesCount !== 1 ? '' : ''}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 font-medium transition-colors px-3 py-1.5 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {commentsCount} Commentaire{commentsCount !== 1 ? 's' : ''}
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          initialComments={post.comments ?? []}
          onCommentAdded={() => setCommentsCount(c => c + 1)}
          onCommentDeleted={() => setCommentsCount(c => c - 1)}
        />
      )}
    </div>
  );
};

export default PostItem;