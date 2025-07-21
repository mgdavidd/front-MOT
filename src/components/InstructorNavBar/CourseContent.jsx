import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseContent.module.css";
import Cookies from "js-cookie";

const getCurrentUser = () => {
  try {
    const userCookie = Cookies.get("user");
    if (!userCookie) return null;
    const decoded = decodeURIComponent(userCookie);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error al parsear cookie:", error);
    return null;
  }
};

export default function CourseContent() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    if (!userId) {
      console.error("No user ID found.");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:3000/teachers/${userId}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Cargando cursos...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mis Cursos</h1>
      {courses.map((curso) => (
        <button
          key={curso.id}
          className={styles.button}
          onClick={() => navigate("/curso", { state: curso })}
        >
          {curso.nombre}
        </button>
      ))}
    </div>
  );
}
