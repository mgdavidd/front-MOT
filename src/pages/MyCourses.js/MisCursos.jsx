import React, { useEffect, useState } from "react";
import "./MisCursos.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function MisCursos() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userCookie);

    fetch(`http://localhost:3000/courses/student/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Formato inesperado");
        setCourses(data);
      })
      .catch(() => setError("Error al cargar cursos"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const openGroupChat = (course) => {
    alert(`Abriendo chat grupal para: ${course.nombre}`);
    // Puedes redirigir o abrir un modal aquí
  };

  return (
    <div className="course-wrapper">
      <h1 className="course-title">Mis Cursos</h1>

      {loading && <p className="course-status">Cargando cursos...</p>}
      {error && <p className="course-status error">{error}</p>}

      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="card-header">
              <div
                className="card-name"
                onClick={() => toggleExpand(course.id)}
              >
                {course.nombre}
              </div>
              <button
                className="chat-btn"
                onClick={() => openGroupChat(course)}
                title="Chat grupal"
              >
                <img src="../../img/mensajero.png" alt="" className="chat-img"/>
                <i className="fas fa-comments"></i>
              </button>
            </div>

            <div
              className="card-preview"
              onClick={() => toggleExpand(course.id)}
            >
              {(course.descripcion || "Sin descripción").slice(0, 40)}...
            </div>

            {expanded === course.id && (
              <div className="card-details">
                {course.descripcion || "Este curso no tiene descripción."}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
