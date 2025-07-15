//Matias trabaja desde aqui
import React from "react";
import "./Profile.module.css";

export default function App() {
  return (
    <div className="app-container">
     
      <header className="header">
        <h1 className="title">My Online Tutor</h1>
        <p className="subtitle">Docentes</p>
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
