import React, { useEffect, useState } from "react";
import "./MisCursos.css";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function MisCursos() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userCookie);

    fetch(`https://server-mot.onrender.com/courses/student/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Formato inesperado");
        setCourses(data);
      })
      .catch(() => setError("Error al cargar cursos"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const openGroupChat = (course, e) => {
    e.stopPropagation();
    navigate(`/course-chat/${course.id}`);
  };

  return (
    <div className="course-wrapper">

      {loading && <p className="course-status">Cargando cursos...</p>}
      {error && <p className="course-status error">{error}</p>}

      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id} className="course-item">
            <div className="course-name">{course.nombre}</div>
            <div
              className="course-card"
              style={{
                backgroundImage: course.portada ? `url(${course.portada})` : "none",
              }}
              onClick={() => navigate("/curso", { state: course })} // 👈 redirige al detalle del curso
            >
              <button
                className="chat-btn"
                onClick={(e) => openGroupChat(course, e)}
                title="Chat grupal"
              >
                <img
                  src="../../img/mensajero.png"
                  alt="Chat"
                  className="chat-img"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
