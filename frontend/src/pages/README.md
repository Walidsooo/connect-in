# Pages

Ce dossier contient les composants de pages principales de l'application.

## Organisation recommandée :

```
pages/
├── Home/
│   ├── Home.jsx
│   └── Home.css (optionnel)
├── Auth/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ForgotPassword.jsx
├── Profile/
│   └── Profile.jsx
└── Dashboard/
    └── Dashboard.jsx
```

## Exemple de page :

```jsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center py-8">
        Bienvenue sur Connect'In
      </h1>
    </div>
  );
}
```
