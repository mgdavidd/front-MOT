import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CoursesList.module.css";

export default function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserPreferences = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return "";
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData.area || "";
    } catch (err) {
      console.error("Error leyendo cookie:", err);
      return "";
    }
  };

  const fetchCourses = async (preferences, search = "") => {
    try {
      setLoading(true);
      setError(null);

      let url = "";

      if (search.trim() !== "") {
        // Buscar usando la nueva ruta de filtrado
        url = `http://localhost:3000/filterCourses/${search}`;
      } else {
        // Cargar cursos por preferencias
        url = `http://localhost:3000/AllCourses/${preferences}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(
          `Error en la petición: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error al obtener cursos:", err);
      setError("No se pudieron cargar los cursos. Intenta nuevamente.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const preferences = getUserPreferences();
    fetchCourses(preferences);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const preferences = value.trim() !== "" ? value : getUserPreferences();
    fetchCourses(preferences);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Buscar cursos de su interés"
        value={searchTerm}
        onChange={handleSearchChange}
        className={styles.searchBar}
      />

      {loading && <p>Cargando cursos...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cardsContainer}>
        {courses.map((course) => (
          <div
            key={course.id}
            className={styles.card}
            onClick={() => setSelectedCourse(course)}
          >
            <img
              src={course.imagen}
              alt={course.nombre}
              className={styles.cardImage}
            />
            <h3>{course.nombre}</h3>
            <p>Precio: ${course.precio}</p>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCourse(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCourse.nombre}</h2>
            <p>{selectedCourse.descripcion}</p>
            <p>
              <strong>Precio:</strong> ${selectedCourse.precio}
            </p>
            <button className={styles.inscriptionBtn}>Inscribirme</button>
          </div>
        </div>
      )}
    </div>
  );
}
