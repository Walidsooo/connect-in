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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->text('content'); // Le texte du message 
            $table->string('image_url')->nullable(); // L'image est optionnelle 

            // Cette ligne lie le post à l'utilisateur qui l'a écrit
            // On met ->nullable() et ->onDelete('set null') pour la règle "Utilisateur supprimé" [cite: 49]
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
