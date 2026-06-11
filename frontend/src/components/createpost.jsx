import React, { useState, useRef } from 'react';
import { postService } from '../services/postservice';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Le contenu ne peut pas être vide');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await postService.createPost(content, image);
            setContent('');
            removeImage();
            if (onPostCreated) onPostCreated(result.post);
        } catch (err) {
            setError('Erreur lors de la création du post');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Publiez votre contenu..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    maxLength={2000}
                />

                {/* Prévisualisation de l'image */}
                {preview && (
                    <div className="relative mt-3 inline-block">
                        <img
                            src={preview}
                            alt="Aperçu"
                            className="rounded-lg max-h-48 object-cover border border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{content.length}/2000</span>
                        {/* Bouton d'ajout d'image */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Photo
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Publication...' : 'Publier'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;

