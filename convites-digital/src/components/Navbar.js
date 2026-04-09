import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const isAuthenticated = !!sessionStorage.getItem("token");
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand" onClick={close}>
        <img src="/android-chrome-192x192.png" alt="Convites Digitais" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
        <span>Convites Digitais</span>
      </NavLink>

      <button
        className={`navbar-toggle${open ? " is-open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span/><span/><span/>
      </button>

      {open && <div className="navbar-overlay" onClick={close}/>}

      <div className={`navbar-menu${open ? " is-open" : ""}`}>
        <NavLink to="/" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close} end>
          Home
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
              Dashboard
            </NavLink>
            <NavLink to="/criar-convite" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
              Criar Convite
            </NavLink>
            <NavLink to="/meus-convites" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
              Meus Convites
            </NavLink>
            <div className="navbar-divider"/>
            <div className="navbar-user">
              <span className="navbar-username">{user?.nome?.split(" ")[0]}</span>
              <button className="navbar-logout" onClick={() => { close(); handleLogout(); }}>
                Sair
              </button>
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
              Login
            </NavLink>
            <NavLink to="/registro" className={({isActive}) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
              Criar Conta
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
