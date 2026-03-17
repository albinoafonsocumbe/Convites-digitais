import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CriarConvite from "./pages/CriarConvite";
import MeusConvites from "./pages/MeusConvites";
import DetalhesEvento from "./pages/DetalhesEvento";
import ConvitePublico from "./pages/ConvitePublico";

// Sessão apenas dura enquanto o browser está aberto (sessionStorage)
// Ao fechar e abrir o browser, sempre pede login novamente
function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Rota pública de convite (sem autenticação) */}
        <Route path="/convite/:id" element={<ConvitePublico />} />

        {/* Callback OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Rotas de autenticação */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />

        {/* Rotas protegidas */}
        <Route path="/" element={<PrivateRoute><Navbar /><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Navbar /><Dashboard /></PrivateRoute>} />
        <Route path="/criar-convite" element={<PrivateRoute><Navbar /><CriarConvite /></PrivateRoute>} />
        <Route path="/meus-convites" element={<PrivateRoute><Navbar /><MeusConvites /></PrivateRoute>} />
        <Route path="/evento/:id" element={<PrivateRoute><Navbar /><DetalhesEvento /></PrivateRoute>} />

        {/* Qualquer rota desconhecida vai para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
