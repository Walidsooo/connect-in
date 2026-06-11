/**
 * Construit l'URL complète d'un fichier stocké dans le storage Laravel.
 * Fonctionne quel que soit l'environnement (localhost, Docker, prod).
 *
 * @param {string|null} path - Chemin relatif retourné par l'API (ex: "avatars/photo.png")
 * @returns {string|null}
 */
export function storageUrl(path) {
  if (!path) return null;
  // Si c'est déjà une URL complète (http/https), on la retourne telle quelle
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // On construit l'URL depuis VITE_API_URL : on remplace "/api" par "/storage"
  const base = (
    import.meta.env.VITE_API_URL || "http://localhost:8000/api"
  ).replace(/\/api\/?$/, "");
  return `${base}/storage/${path}`;
}
