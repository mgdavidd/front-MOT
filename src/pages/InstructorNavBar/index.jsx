import React, { useEffect, useState } from "react";
import "../../assets/styles/instructorNavBar/index.css";
import { useNavigate } from "react-router-dom";
import CourseContent from "../../components/InstructorNavBar/CourseContent";
import InstructorCal from "../../components/InstructorNavBar/InstructorCal";
import ListStudents from "../../components/InstructorNavBar/ListStudents";
import Cookies from "js-cookie";

function InstructorNavBar() {
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

      if (userRole === "estudiante") {
        navigate("/studentNav");
      } else if (userRole !== "profesor") {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      navigate("/");
    }
  }, [navigate]);

  const tabs = [
    { id: "courses", label: "Mis cursos" },
    { id: "students", label: "Estudiantes" },
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
