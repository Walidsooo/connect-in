# Components

Ce dossier contient tous les composants React réutilisables de l'application.

## Organisation recommandée :

```
components/
├── common/          # Composants communs (Button, Input, Card, etc.)
├── layout/          # Composants de mise en page (Header, Footer, Sidebar, etc.)
├── forms/           # Composants de formulaires
└── ui/              # Composants d'interface utilisateur
```

## Exemple de composant :

```jsx
export default function Button({ children, onClick, variant = "primary" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${variant === "primary" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
    >
      {children}
    </button>
  );
}
```
