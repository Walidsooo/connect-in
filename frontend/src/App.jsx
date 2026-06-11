import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Profile from './pages/profile';
import Landing from './pages/landing';
import Welcome from './pages/welcome';
import Home from './components/home';
import ProtectedRoute from './components/protectedroute';
import { useAuth } from './context/authcontext';

function App() {
  const { authenticated, loading } = useAuth();

  // Attendre que le contexte vérifie le token avant de rendre quoi que ce soit
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={authenticated ? <ProtectedRoute><Welcome /></ProtectedRoute> : <Landing />} />
        <Route path="/login" element={authenticated ? <Navigate to="/feed" replace /> : <Login />} />
        <Route path="/register" element={authenticated ? <Navigate to="/feed" replace /> : <Register />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
