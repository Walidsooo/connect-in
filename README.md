# Connect'In — Réseau social interne d'entreprise ESN

> Plateforme de partage et d'échange entre collaborateurs d'une ESN (Entreprise de Services du Numérique).

---

## 📁 Code source complet du projet

```
backend/    → API REST Laravel (PHP)
frontend/   → Interface React + Tailwind CSS
docker/     → Configuration Docker (PHP, MySQL)
```

---

## 🚀 Installation

### Prérequis

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0 (via Docker ou en local)
- Docker & Docker Compose (optionnel mais recommandé)

---

### Option A — Avec Docker (recommandé)

```bash
# Cloner le projet
git clone <url-du-repo>
cd connect-in

# Lancer tous les services (MySQL, PHP, React, phpMyAdmin)
docker-compose up -d

# Accéder à l'app
# Frontend  → http://localhost:5173
# Backend   → http://localhost:8000
# phpMyAdmin → http://localhost:8080
```

---

### Option B — Sans Docker (local)

#### Backend (Laravel)

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier et configurer l'environnement
cp .env.example .env

# Éditer .env : renseigner DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
# Puis générer la clé applicative
php artisan key:generate

# Lancer les migrations (création des tables)
php artisan migrate

# (Optionnel) Peupler la BDD avec des données de test
php artisan db:seed

# Démarrer le serveur
php artisan serve
# → disponible sur http://localhost:8000
```

#### Frontend (React)

```bash
cd frontend

# Installer les dépendances JS
npm install

# Démarrer le serveur de développement
npm run dev
# → disponible sur http://localhost:5173
```

---

## ⚙️ Configuration

### Variables d'environnement (`backend/.env`)

| Variable                   | Description               | Exemple          |
| -------------------------- | ------------------------- | ---------------- |
| `DB_CONNECTION`            | Driver BDD                | `mysql`          |
| `DB_HOST`                  | Hôte MySQL                | `127.0.0.1`      |
| `DB_PORT`                  | Port MySQL                | `3306`           |
| `DB_DATABASE`              | Nom de la base            | `connectin_db`   |
| `DB_USERNAME`              | Utilisateur MySQL         | `root`           |
| `DB_PASSWORD`              | Mot de passe MySQL        | `root`           |
| `SANCTUM_STATEFUL_DOMAINS` | Domaines autorisés (CORS) | `localhost:5173` |

> ⚠️ Le domaine des emails est restreint à `@entreprise-esn.com`.

---

## 🔌 Utilisation de l'API

### Base URL

```
http://localhost:8000/api
```

### Authentification

L'API utilise **Laravel Sanctum** (tokens Bearer).  
Inclure le token dans les requêtes protégées :

```
Authorization: Bearer <votre_token>
```

---

### Endpoints

#### 🔓 Routes publiques

| Méthode | Endpoint        | Description |
| ------- | --------------- | ----------- |
| `POST`  | `/api/register` | Inscription |
| `POST`  | `/api/login`    | Connexion   |

**Inscription — corps de la requête :**

```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "developer",
  "email": "jean.dupont@entreprise-esn.com",
  "password": "motdepasse",
  "password_confirmation": "motdepasse"
}
```

Rôles disponibles : `developer` · `designer` · `manager` · `devops` · `consultant` · `other`

**Connexion — corps de la requête :**

```json
{
  "email": "jean.dupont@entreprise-esn.com",
  "password": "motdepasse"
}
```

---

#### 🔒 Routes protégées (Bearer Token requis)

**Profil utilisateur**

| Méthode  | Endpoint             | Description              |
| -------- | -------------------- | ------------------------ |
| `GET`    | `/api/user`          | Récupérer son profil     |
| `PUT`    | `/api/user`          | Modifier nom / prénom    |
| `PUT`    | `/api/user/password` | Modifier le mot de passe |
| `DELETE` | `/api/user`          | Supprimer son compte     |
| `POST`   | `/api/logout`        | Déconnexion              |

**Posts**

| Méthode  | Endpoint          | Description           |
| -------- | ----------------- | --------------------- |
| `GET`    | `/api/posts`      | Lister tous les posts |
| `POST`   | `/api/posts`      | Créer un post         |
| `PUT`    | `/api/posts/{id}` | Modifier son post     |
| `DELETE` | `/api/posts/{id}` | Supprimer son post    |

**Likes**

| Méthode | Endpoint               | Description             |
| ------- | ---------------------- | ----------------------- |
| `POST`  | `/api/posts/{id}/like` | Liker / Unliker un post |

**Commentaires**

| Méthode  | Endpoint             | Description              |
| -------- | -------------------- | ------------------------ |
| `POST`   | `/api/comments`      | Ajouter un commentaire   |
| `PUT`    | `/api/comments/{id}` | Modifier un commentaire  |
| `DELETE` | `/api/comments/{id}` | Supprimer un commentaire |

---

## 🗄️ Diagramme de la base de données

![Diagramme BDD](./diagrame%20base%20de%20donnée%20.png)

**Tables :**

- **users** — id, nom, prenom, role, email, password, timestamps
- **posts** — id, user_id (FK), content, image_url, timestamps
- **comments** — id, post_id (FK), user_id (FK), content, timestamps
- **likes** — id, post_id (FK), user_id (FK), timestamps
- **personal_access_tokens** — gestion des tokens Sanctum

---

## 📚 Documentation de l'API

### Postman

Importer la collection Postman `postman_collection.json` (à la racine du projet) pour tester tous les endpoints.

### Swagger / OpenAPI

La documentation interactive Swagger est disponible à :

```
http://localhost:8000/api/documentation
```

> Pour l'activer : `composer require darkaonline/l5-swagger` puis `php artisan l5-swagger:generate`

---

## 🐋 Accès MySQL en terminal

Si MySQL tourne via Docker :

```bash
# Se connecter au conteneur MySQL
docker exec -it connectin_mysql mysql -u root -proot connectin_db

# Quelques commandes utiles
SHOW TABLES;
SELECT id, nom, prenom, role, email FROM users;
SELECT * FROM posts;
EXIT;
```

Si MySQL est installé localement :

```bash
mysql -u root -p
USE connectin_db;
SHOW TABLES;
```
