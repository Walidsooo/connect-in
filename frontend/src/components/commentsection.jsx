import React, { useState } from 'react';
import commentService from '../services/commentservice';
import { useAuth } from '../context/authcontext';

const CommentSection = ({ postId, initialComments, onCommentAdded, onCommentDeleted }) => {
    const { user } = useAuth();
    const [comments, setComments]   = useState(initialComments || []);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading]   = useState(false);

    // États pour l'édition d'un commentaire
    const [editingId, setEditingId]       = useState(null);
    const [editContent, setEditContent]   = useState("");
    const [editLoading, setEditLoading]   = useState(false);

    // Ajouter un commentaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const addedComment = await commentService.createComment(postId, newComment);
            setComments([...comments, addedComment]);
            setNewComment("");
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Modifier un commentaire
    const handleUpdate = async (commentId) => {
        if (!editContent.trim()) return;
        setEditLoading(true);
        try {
            const updated = await commentService.updateComment(commentId, editContent);
            setComments(comments.map(c => c.id === commentId ? { ...c, content: updated.content } : c));
            setEditingId(null);
        } catch (error) {
            console.error("Erreur modification commentaire :", error);
        } finally {
            setEditLoading(false);
        }
    };

    // Supprimer un commentaire
    const handleDelete = async (commentId) => {
        if (!window.confirm("Supprimer ce commentaire ?")) return;
        try {
            await commentService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
            if (onCommentDeleted) onCommentDeleted();
        } catch (error) {
            console.error("Erreur suppression commentaire :", error);
        }
    };

    return (
        <div className="mt-4 border-t border-slate-800 pt-4">
            <h4 className="text-sm font-semibold mb-3 text-slate-400">Commentaires ({comments.length})</h4>

            <div className="space-y-3 mb-4">
                {comments.map((comment) => {
                    const commentAuthor = comment.user
                        ? comment.user.name ?? `${comment.user.prenom ?? ''} ${comment.user.nom ?? ''}`.trim()
                        : "Utilisateur supprimé";
                    const isOwner = user && comment.user_id === user.id;

                    return (
                        <div key={comment.id} className="bg-slate-800/60 p-3 rounded-lg text-sm border border-slate-700/50">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-slate-300">{commentAuthor}</span>
                                {isOwner && editingId !== comment.id && (
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                                            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-700 transition-colors"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-xs text-red-500 hover:text-red-400 px-2 py-0.5 rounded border border-red-900/50 hover:bg-red-500/10 transition-colors"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingId === comment.id ? (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                    />
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            onClick={() => handleUpdate(comment.id)}
                                            disabled={editLoading}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {editLoading ? '...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-slate-500 hover:text-slate-300 text-xs px-2"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 mt-1">{comment.content}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Écrire un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-500 disabled:opacity-50"
                    disabled={isLoading || !newComment.trim()}
                >
                    {isLoading ? "..." : "Publier"}
                </button>
            </form>
        </div>
    );
};

export default CommentSection;