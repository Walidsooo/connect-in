<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->text('content'); // Le contenu du commentaire

            // 1. Lien avec l'auteur (même logique que pour les posts)
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // 2. Lien avec le post
            // Si le post est supprimé, on supprime automatiquement tous ses commentaires
            $table->foreignId('post_id')->constrained()->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
