<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
// Permet de remplir ces champs via l'API (Mass Assignment)
protected $fillable = ['content', 'user_id', 'post_id'];

// Un commentaire appartient à un auteur (User)
public function user()
{
return $this->belongsTo(User::class);
}

// Un commentaire est lié à un post précis
public function post()
{
return $this->belongsTo(Post::class);
}
}