import React, { useState } from 'react';
import './ListStudents.css'; // Para los estilos

function ListStudents() {
  const coursesWithStudents = {
    programacion: [
      { nombre: "Yeisson Abadia", correo: "yeissonabadia@gmail.com", promedio: 2.0 },
      { nombre: "Matías", correo: "matias@gmail.com", promedio: 1.0 }
    ],
    fisica: [
      { nombre: "Valeria", correo: "vale@gmail.com", promedio: 2.9 }
    ],
    psicologia: [
      { nombre: "Laura", correo: "laura@gmail.com", promedio: 3.5 },
      { nombre: "Carlos", correo: "carlos@gmail.com", promedio: 2.8 }
    ]
  };

  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (course) => {
    setOpenCourse(openCourse === course ? null : course);
  };

  return (
    <div className="container">
      {Object.entries(coursesWithStudents).map(([courseName, students]) => (
        <div key={courseName} className="course">
          <div className="course-header" onClick={() => toggleCourse(courseName)}>
            {courseName.toUpperCase()}
            <span className="arrow">{openCourse === courseName ? '▲' : '▼'}</span>
          </div>
          {openCourse === courseName && (
            <ul className="student-list">
              {students.map((student, index) => (
                <li key={index} className="student">
                  <p><strong>Nombre:</strong> {student.nombre}</p>
                  <p><strong>Correo:</strong> {student.correo}</p>
                  <p><strong>Promedio:</strong> {student.promedio}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default ListStudents;
