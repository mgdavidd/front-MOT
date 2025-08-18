import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./ListStudents.css";

function ListStudents() {
  const [courses, setCourses] = useState([]);
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [openCourse, setOpenCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clasificación visual de promedio
  const getPromedioClass = (promedio) => {
    if (promedio >= 4.6 && promedio <= 5.0) return "alto";
    if (promedio >= 4.0) return "bueno";
    if (promedio >= 3.0) return "regular";
    return "bajo";
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      console.error("No se encontró cookie 'user'");
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userCookie);

    // Parsear el google_token si es string
    let googleTokenData = userData.google_token;
    if (typeof googleTokenData === "string") {
      try {
        googleTokenData = JSON.parse(googleTokenData);
      } catch (err) {
        console.error("Error parseando google_token:", err);
      }
    }

    const token = googleTokenData?.access_token;
    const userId = userData?.id;

    if (!token || !userId) {
      console.error("Falta token o id en cookie 'user'");
      window.location.href = "/login";
      return;
    }

    fetch(`http://localhost:3000/teachers/${userId}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Error cargando cursos:", err));
  }, []);

  // Cargar estudiantes de un curso cuando se abre
  const toggleCourse = async (courseId) => {
    if (openCourse === courseId) {
      setOpenCourse(null);
      return;
    }
    setOpenCourse(courseId);

    if (!studentsByCourse[courseId]) {
      try {
        const userData = JSON.parse(Cookies.get("user"));
        const token = userData?.google_token?.access_token;

        const res = await fetch(
          `http://localhost:3000/my-students/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Error en la carga de estudiantes");

        const data = await res.json();
        setStudentsByCourse((prev) => ({ ...prev, [courseId]: data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="container">
      {courses.length === 0 && <p>No tienes cursos asignados.</p>}

      {courses.map((course) => (
        <div key={course.id} className="course">
          <div
            className="course-header"
            onClick={() => toggleCourse(course.id)}
          >
            {course.nombre.toUpperCase()}
            <span className="arrow">
              {openCourse === course.id ? "▲" : "▼"}
            </span>
          </div>
          {openCourse === course.id && (
            <ul className="student-list">
              {(studentsByCourse[course.id] || []).map((student) => (
                <li
                  key={student.id}
                  className="student"
                  onClick={() => openStudentModal(student)}
                >
                  <img
                    src={student.fotoPerfil || "../../img/usuario.png"}
                    alt={student.nombre}
                    className="student-img"
                    style={{
                      backgroundColor: student.color_perfil || "transparent",
                    }}
                  />
                  <p>
                    <strong>{student.nombre}</strong>
                  </p>
                  <p>{student.nombre_usuario}</p>
                  <p
                    className={`promedio ${getPromedioClass(student.promedio)}`}
                  >
                    {student.promedio ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {isModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedStudent.nombre}</h2>
            <p>
              <strong>Usuario:</strong> {selectedStudent.nombre_usuario}
            </p>
            <p>
              <strong>Promedio:</strong>
              <span
                className={`promedio ${getPromedioClass(
                  selectedStudent.promedio
                )}`}
              >
                {selectedStudent.promedio ?? "—"}
              </span>
            </p>
            <button
              onClick={() =>
                (window.location.href = `/private-chat/${selectedStudent.id}`)
              }
            >
              Ir al chat privado
            </button>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListStudents;
