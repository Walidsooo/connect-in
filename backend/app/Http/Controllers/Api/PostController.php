<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     * Supports: ?search=..., ?sort=date|popular, ?page=N
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $search = $request->query('search');
        $sort   = $request->query('sort', 'date');

        $query = Post::with(['user', 'comments.user'])
            ->withCount(['likes', 'comments']);

        // Recherche dans le contenu
        if ($search) {
            $query->where('content', 'like', "%{$search}%");
        }

        // Tri : date (défaut) ou popularité
        if ($sort === 'popular') {
            $query->orderByDesc('likes_count');
        } else {
            $query->latest();
        }

        $paginator = $query->paginate(10);

        $posts = collect($paginator->items())->map(function ($post) use ($userId) {
            return [
                'id'             => $post->id,
                'content'        => $post->content,
                'image_url'      => $post->image_url ?? null,
                'likes_count'    => $post->likes_count,
                'comments_count' => $post->comments_count,
                'is_liked'       => $post->likes()->where('user_id', $userId)->exists(),
                'created_at'     => $post->created_at,
                'author' => $post->user ? [
                    'id'     => $post->user->id,
                    'name'   => trim($post->user->prenom . ' ' . $post->user->nom),
                    'role'   => $post->user->role,
                    'avatar' => $post->user->avatar ?? null,
                ] : null,
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id'         => $comment->id,
                        'content'    => $comment->content,
                        'created_at' => $comment->created_at,
                        'user_id'    => $comment->user_id,
                        'user'       => $comment->user ? [
                            'id'   => $comment->user->id,
                            'name' => trim($comment->user->prenom . ' ' . $comment->user->nom),
                        ] : null,
                    ];
                }),
            ];
        });

        return response()->json([
            'data'         => $posts,
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $request->file('image')->store('posts', 'public');
        }

        $post = $request->user()->posts()->create([
            'content'   => $validated['content'],
            'image_url' => $imageUrl,
        ]);

        return response()->json([
            'message' => 'Post créé avec succès !',
            'post'    => $post,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // Vérification de l'auteur (Sécurité)
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $post->update($validated);

        return response()->json([
            'message' => 'Post mis à jour !',
            'post' => $post
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Post $post)
    {
        // Vérification de l'auteur (Sécurité)
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        // Supprimer l'image physique si elle existe
        if ($post->image_url) {
            Storage::disk('public')->delete($post->image_url);
        }

        $post->delete();

        return response()->json(['message' => 'Post supprimé avec succès.']);
    }
}
