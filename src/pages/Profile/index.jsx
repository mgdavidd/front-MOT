import React from "react";
import "./Profile.module.css";
import Cookies from "js-cookie";

export default function App() {
  let user = null;
  const cookieValue = Cookies.get("user");

  if (cookieValue) {
    try {
      const decoded = decodeURIComponent(cookieValue);
      user = JSON.parse(decoded);
    } catch (error) {
      console.error("Error al parsear la cookie:", error);
    }
  }

  const userName = location.state?.userName || user?.nombre || "Invitado";
  const userEmail = user?.email || "Correo no disponible";
  const userArea = user?.area || "Área no disponible";
  const userRol = user?.rol || "sin Rol";

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">My Online Tutor</h1>
        <h1 className="title">{userRol}</h1>
        <p className="subtitle">{userName}</p>
        <p className="subtitle">{userEmail}</p>
        <p className="subtitle">{userArea}</p>
      </header>

      <main className="main-content">
        <button className="main-button">Crear curso</button>
        <button className="main-button">Editar perfil</button>
      </main>

      <nav className="bottom-nav">
        <NavItem label="Estudiantes" />
        <NavItem label="Calendario" />
        <NavItem label="Montar video" />
      </nav>
    </div>
  );
}

function NavItem({ label }) {
  return (
    <div className="nav-item">
      <div className="nav-icon"></div>
      <span className="nav-label">{label}</span>
    </div>
  );
}
