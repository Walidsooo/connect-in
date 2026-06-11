# Hooks

Ce dossier contient les hooks React personnalisés.

## Organisation recommandée :

```
hooks/
├── useAuth.js       # Hook pour gérer l'authentification
├── useFetch.js      # Hook pour gérer les requêtes API
├── useForm.js       # Hook pour gérer les formulaires
└── useDebounce.js   # Hook pour le debouncing
```

## Exemple de hook :

```jsx
import { useState, useEffect } from "react";
import api from "../services/api";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```
