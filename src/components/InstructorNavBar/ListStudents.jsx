import React, { useState } from 'react';
import './ListStudents.css'; // Para los estilos

function ListStudents() {
  const coursesWithStudents = {
    programacion: [
      { nombre: "Yeisson Abadia", correo: "yeissonabadia@gmail.com", promedio: 2.9 },
      { nombre: "Matías", correo: "matias@gmail.com", promedio: 3.5 },
      { nombre: "David Mejia", correo: "davidmejiia@gmail.com", promedio: 4.8 },
      { nombre: "Karen Ramirez", correo: "karenraaaz29@gmail.com", promedio: 4.0 }
    ],
    fisica: [
      { nombre: "Valeria", correo: "vale@gmail.com", promedio: 2.5 },
      { nombre: "Cristian Mejia", correo: "crismjiia@gmail.com", promedio: 1.8 },
      { nombre: "Leanis Florez", correo: "lesreez24@gmail.com", promedio: 4.2 },
      { nombre: "Laura Jaramillo", correo: "laurajaramillo@gmail.com", promedio: 4.8 },
      { nombre: "Karen Ramirez", correo: "karenraaaz29@gmail.com", promedio: 3.0}
    ],
    psicologia: [
      { nombre: "Laura", correo: "laura@gmail.com", promedio: 3.5 },
      { nombre: "Carlos", correo: "carlos@gmail.com", promedio: 2.8 },
      { nombre: "Sara Suarez", correo: "suarezsuarez@gmail.com", promedio: 3.6 },
      { nombre: "Karen Salazar", correo: "karenzarr29@gmail.com", promedio: 4.7 }
    ]
  };

  const [openCourse, setOpenCourse] = useState(null);

  const toggleCourse = (course) => {
    setOpenCourse(openCourse === course ? null : course);
  };

   const getPromedioClass = (promedio) => {
   if (promedio >= 4.6 && promedio <= 5.0) return "alto";
   if (promedio >= 4.0) return "bueno";
   if (promedio >= 3.0) return "regular";
   return "bajo";
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
                  <img src="../../img/usuario.png" alt="" className='student-img'/>
                  <p><strong>{student.nombre}</strong></p>
                  <p>{student.correo}</p>
                  <p className={`promedio ${getPromedioClass(student.promedio)}`}> 
                    {student.promedio}
</p>
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
