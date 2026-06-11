<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Post extends Model
{
    protected $fillable = [
        'content',
        'image_url',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    protected $appends = ['is_liked_by_current_user'];

    public function getIsLikedByCurrentUserAttribute()
    {
        if (!Auth::check()) return false;

        return $this->likes()->where('user_id', Auth::id())->exists();
    }
}
