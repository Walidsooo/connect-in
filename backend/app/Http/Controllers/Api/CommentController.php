<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Ajouter un commentaire à un post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id', // Vérifie que le post existe 
            'content' => 'required|string|max:1000', // Texte obligatoire 
        ]);

        $comment = $request->user()->comments()->create($validated);

        return response()->json([
            'message' => 'Commentaire ajouté !',
            'comment' => $comment->load('user:id,nom,prenom') // Charge l'auteur pour le Front 
        ], 201);
    }

    /**
     * Modifier son propre commentaire.
     */
    public function update(Request $request, Comment $comment)
    {
        // Vérification de sécurité : seul l'auteur peut modifier [cite: 29, 57]
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update($validated);

        return response()->json([
            'message' => 'Commentaire mis à jour !',
            'comment' => $comment
        ]);
    }

    /**
     * Supprimer son propre commentaire.
     */
    public function destroy(Request $request, Comment $comment)
    {
        // Vérification de sécurité : seul l'auteur peut supprimer [cite: 29, 57]
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Commentaire supprimé.']);
    }
}