<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;

// Routes publiques (Inscription et Connexion)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par Sanctum (Nécessitent une authentification)
Route::middleware('auth:sanctum')->group(function () {

    // Gestion du profil utilisateur
    Route::get('/user', [AuthController::class, 'profile']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

    // CRUD des Posts
    Route::apiResource('posts', PostController::class);

    // Likes (toggle)
    Route::post('/posts/{post}/like', [LikeController::class, 'toggle']);

    // CRUD des Commentaires
    Route::apiResource('comments', CommentController::class)->except(['index', 'show']);
});
