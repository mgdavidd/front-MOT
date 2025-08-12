// InstructorNavBar.js
import React, { useEffect, useState } from "react";
import "../../assets/styles/instructorNavBar/index.css";
import { useNavigate } from "react-router-dom";
import Explore from "../../components/StudentNavBar/Explore";
import CalendarStudent from "../../components/StudentNavBar/CalendarStudent";
import Cookies from "js-cookie";
import MisCursos from "../../components/StudentNavBar/MyCourses.js/MisCursos"

function StudentNavBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/profile");
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

      if (userRole === "profesor") {
        navigate("/instructorNav");
      } else if (userRole !== "estudiante") {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      navigate("/");
    }
  }, [navigate]);

  const tabs = [
    { id: "courses", label: "Explorar" },
    { id: "students", label: "Mis Cursos" },
    { id: "calendar", label: "Calendario" },
  ];

  return (
    <div className="instructor-dashboard">
      <header className="dashboard-header">
        <h1>My Online Tutor</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <button type="submit" className="profileButton">
            <img src="../../../img/usuario.png" alt="" className="profileImg" />
          </button>
        </form>
      </header>

      <div className="content-container">
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {activeTab === "courses" && (
            <div className="content-section">
              <h2>Explorar</h2>
              <div className="content-placeholder">
                <Explore />
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="content-section">
              <h2>Mis Cursos</h2>
              <div className="content-placeholder">
                <MisCursos />
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="content-section">
              <h2>Calendario</h2>
              <div className="content-placeholder">
                <CalendarStudent />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentNavBar;
