import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseContent from "../../components/InstructorNavBar/CourseContent";
import InstructorCal from "../../components/InstructorNavBar/InstructorCal";
import ListStudents from "../../components/InstructorNavBar/ListStudents";
import Cookies from "js-cookie";

function InstructorNavBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const [userPrimaryColor, setUserPrimaryColor] = useState("#42A5F5"); // Color por defecto que coincida con el perfil

  const handleProfile = (e) => {
    e.preventDefault();
    navigate("/profile");
  };

  const handleChats = (e) => {
    e.preventDefault();
    navigate("/mychats");
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(userCookie);
      const userRole = user.rol?.toLowerCase();

      // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Obtenemos el color del usuario correctamente
      let userColor = "#42A5F5"; // Color por defecto
      
      // Si es el formato normalizado (objeto directo)
      if (user.color_perfil) {
        userColor = user.color_perfil;
      }
      // Si es el formato con rows (array)
      else if (user.rows && user.rows[0] && user.rows[0][10]) {
        userColor = user.rows[0][10];
      }

      console.log("🎨 Color del usuario detectado:", userColor); // Para debug
      setUserPrimaryColor(userColor);

      // 🔥 APLICAR EL COLOR INMEDIATAMENTE AL DOM
      document.documentElement.style.setProperty('--color-primary', userColor);

      // Validación de roles
      if (userRole === "estudiante") {
        navigate("/studentNav");
      } else if (userRole !== "profesor") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error parseando cookie de usuario:", error);
      navigate("/");
    }
  }, [navigate]);

  // 🔥 EFECTO ADICIONAL para asegurar que el color se aplique
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', userPrimaryColor);
    console.log("🎨 Color aplicado al DOM:", userPrimaryColor);
  }, [userPrimaryColor]);

  const tabs = [
    { id: "courses", label: "Mis cursos" },
    { id: "students", label: "Estudiantes" },
    { id: "calendar", label: "Calendario" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Animación suave al cambiar tabs
    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.style.animation = 'none';
      tabContent.offsetHeight; // Trigger reflow
      tabContent.style.animation = 'slideIn 0.3s ease-out';
    }
  };

  return (
    <div className="instructor-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>My Online Tutor</h1>
          <p>Panel de Instructor</p>
        </div>
        <div className="header-buttons">
          <button 
            onClick={handleChats} 
            className="chatsButton"
            title="Mis Chats"
          >
            <img 
              src="../../../img/mensajero.png" 
              alt="Chats" 
              className="chatsImg" 
            />
          </button>
          <button 
            onClick={handleProfile} 
            className="profileButton"
            title="Mi Perfil"
          >
            <img 
              src="../../img/usuario.png" 
              alt="Perfil" 
              className="profileImg" 
            />
          </button>
        </div>
      </header>

      <div className="content-container">
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {activeTab === "courses" && (
            <div className="content-section">
              <h2>Mis Cursos</h2>
              <div className="content-placeholder">
                <CourseContent />
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="content-section">
              <h2>Estudiantes</h2>
              <div className="content-placeholder">
                <ListStudents />
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="content-section">
              <h2>Calendario</h2>
              <div className="content-placeholder">
                <InstructorCal />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorNavBar;