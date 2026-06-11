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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();

            // Lien avec l'utilisateur : s'il est supprimé, le like est supprimé 
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Lien avec le post : si le post disparait, le like aussi
            $table->foreignId('post_id')->constrained()->onDelete('cascade');

            // LA RÈGLE D'OR : Empêcher les doublons (un seul like par personne par post) 
            $table->unique(['user_id', 'post_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
