<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /**
     * Toggle like/unlike sur un post.
     */
    public function toggle(Request $request, Post $post)
    {
        $user = $request->user();

        $existingLike = $post->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            // Déjà liké → on retire le like
            $existingLike->delete();
            $isLiked = false;
        } else {
            // Pas encore liké → on ajoute
            $post->likes()->create(['user_id' => $user->id]);
            $isLiked = true;
        }

        return response()->json([
            'likes_count' => $post->likes()->count(),
            'is_liked'    => $isLiked,
        ]);
    }
}
