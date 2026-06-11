<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validation des données 
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'role' => 'required|string|in:developer,designer,manager,devops,consultant,other',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users',
                'regex:/^[a-z0-9._%+-]+@entreprise-esn\.com$/i' // Contrainte email pro
            ],
            'password' => 'required|string|min:8|confirmed',
        ], [
            'nom.required'            => 'Le nom est obligatoire.',
            'nom.max'                 => 'Le nom ne peut pas dépasser 255 caractères.',
            'prenom.required'         => 'Le prénom est obligatoire.',
            'prenom.max'              => 'Le prénom ne peut pas dépasser 255 caractères.',
            'role.required'           => 'Le rôle est obligatoire.',
            'role.in'                 => 'Le rôle sélectionné est invalide.',
            'email.required'          => "L'adresse email est obligatoire.",
            'email.email'             => "L'adresse email n'est pas valide.",
            'email.max'               => "L'adresse email ne peut pas dépasser 255 caractères.",
            'email.unique'            => 'Cette adresse email est déjà utilisée par un autre compte.',
            'email.regex'             => "L'email doit appartenir au domaine @entreprise-esn.com (ex: prenom.nom@entreprise-esn.com).",
            'password.required'       => 'Le mot de passe est obligatoire.',
            'password.min'            => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'      => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Création de l'utilisateur 
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'role' => $request->role,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 3. Génération du Token pour Raphaël 
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // 1. Validation des champs
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required'    => "L'adresse email est obligatoire.",
            'email.email'       => "L'adresse email n'est pas valide.",
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        // 2. Vérifier si l'email existe
        $user = User::where('email', $request->email)->first();

        // 3. Vérifier le mot de passe
        // Hash::check compare le texte clair avec la version cryptée en base
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response([
                'message' => 'Email ou mot de passe incorrect.'
            ], 401);
        }

        // 4. Créer un nouveau token pour cette session
        $token = $user->createToken('main_token')->plainTextToken;

        return response([
            'user' => $user,
            'token' => $token
        ], 200);
    }
    // Récupérer les infos de l'utilisateur connecté
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // Supprimer le token (Déconnexion)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // Modifier les informations du profil (nom, prénom)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nom'    => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
        ], [
            'nom.required'    => 'Le nom est obligatoire.',
            'nom.max'         => 'Le nom ne peut pas dépasser 255 caractères.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'prenom.max'      => 'Le prénom ne peut pas dépasser 255 caractères.',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $user->fresh(),
        ]);
    }

    // Modifier le mot de passe
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => "L'ancien mot de passe est obligatoire.",
            'password.required'         => 'Le nouveau mot de passe est obligatoire.',
            'password.min'              => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'        => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    // Mettre à jour la photo de profil
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'avatar.required' => 'Aucune image fournie.',
            'avatar.image'    => 'Le fichier doit être une image.',
            'avatar.mimes'    => 'Formats acceptés : jpeg, png, jpg, gif.',
            'avatar.max'      => "L'image ne doit pas dépasser 2 Mo.",
        ]);

        $user = $request->user();

        // Supprimer l'ancienne photo si elle existe
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour.',
            'user'    => $user->fresh(),
            'avatar'  => $path,
        ]);
    }

    // Suppression du compte utilisateur
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $option = $request->input('option', 'anonymize');

        if ($option === 'delete_all') {
            // Option 1 : Supprime tous les posts et commentaires de l'utilisateur
            $user->posts()->delete();
        }
        // Option 2 (anonymize) : les posts restent mais user_id → NULL
        // grâce à onDelete('set null') déjà défini dans la migration posts

        // Supprime tous les tokens de l'utilisateur
        $user->tokens()->delete();

        // Supprime l'utilisateur
        $user->delete();

        return response()->json(['message' => 'Compte supprimé avec succès.'], 200);
    }
}
