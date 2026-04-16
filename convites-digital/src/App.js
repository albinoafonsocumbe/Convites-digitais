import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CriarConvite from "./pages/CriarConvite";
import MeusConvites from "./pages/MeusConvites";
import DetalhesEvento from "./pages/DetalhesEvento";
import EditarConvite from "./pages/EditarConvite";
import EsqueciSenha from "./pages/EsqueciSenha";
import ResetSenha from "./pages/ResetSenha";
import ConvitePublico from "./pages/ConvitePublico";

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? <Navigate to="/home" replace /> : children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Landing page pública — indexada pelo Google */}
        <Route path="/" element={<LandingPage />} />

        {/* Rota pública de convite */}
        <Route path="/convite/:id" element={<ConvitePublico />} />

        {/* Callback OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Rotas de autenticação */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
        <Route path="/esqueci-senha" element={<PublicRoute><EsqueciSenha /></PublicRoute>} />
        <Route path="/reset-senha" element={<PublicRoute><ResetSenha /></PublicRoute>} />

        {/* Rotas protegidas */}
        <Route path="/home" element={<PrivateRoute><Navbar /><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        <Route path="/criar-convite" element={<PrivateRoute><Navbar /><CriarConvite /></PrivateRoute>} />
        <Route path="/meus-convites" element={<PrivateRoute><Navbar /><MeusConvites /></PrivateRoute>} />
        <Route path="/evento/:id" element={<PrivateRoute><Navbar /><DetalhesEvento /></PrivateRoute>} />
        <Route path="/editar/:id" element={<PrivateRoute><Navbar /><EditarConvite /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
