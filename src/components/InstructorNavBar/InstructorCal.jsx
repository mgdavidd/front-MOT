// src/components/InstructorCal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import './InstructorCal.css';

const InstructorCal = () => {
  // Datos de ejemplo de cursos
  const courses = {
    programacion: { name: "Programación", roomId: "curso_programacion" },
    fisica: { name: "Física", roomId: "curso_fisica" },
    psicologia: { name: "Psicología", roomId: "curso_psicologia" }
  };

  const [selectedCourseId, setSelectedCourseId] = useState('programacion');
  const [currentEventType, setCurrentEventType] = useState('virtual');
  const [dateEvents, setDateEvents] = useState({});
  const [hoursByDate, setHoursByDate] = useState({});
  const calendarRef = useRef(null);
  const timeSelectorsRef = useRef(null);
  const [isOwner] = useState(true);

  // Función memoizada para actualizar la visualización
  const updateDisplay = useCallback((dateEventsToShow, hoursByDateToShow) => {
    if (!timeSelectorsRef.current) return;
    
    const timeSelectorsDiv = timeSelectorsRef.current;
    timeSelectorsDiv.innerHTML = "";
    
    const sortedDates = Object.keys(dateEventsToShow).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    sortedDates.forEach((date) => {
      const eventType = dateEventsToShow[date];
      const { start = "", end = "", grabacion_url, titulo, es_publico } = hoursByDateToShow[date] || {};

      const fechaFin = DateTime.fromISO(date).plus({ days: 1 });
      const ahora = DateTime.local();
      const esPasada = ahora > fechaFin;

      const div = document.createElement("div");
      div.className = `date-time-selector ${eventType}-class`;

      div.innerHTML = `
        <span class="event-type ${eventType}">${eventType.toUpperCase()}</span>
        <label>${formatDate(date)}</label>
        <input type="time" name="start-${date}" value="${start}" required ${esPasada || !isOwner || grabacion_url ? "disabled" : ""}>
        <input type="time" name="end-${date}" value="${end}" required ${esPasada || !isOwner || grabacion_url ? "disabled" : ""}>
        ${
          grabacion_url
            ? (() => {
                if (!es_publico && !isOwner) {
                  return `<span style="color:#888;margin-left:10px;">(Grabación privada)</span>`;
                }
                const match = grabacion_url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
                const fileId = match ? match[1] : null;
                const thumbnailUrl = fileId
                  ? `https://drive.google.com/thumbnail?id=${fileId}`
                  : "";
                return `
      <span class="video-thumb-trigger" style="margin-left:10px;cursor:pointer;position:relative;" title="Ver grabación">
        📹
        ${
          thumbnailUrl
            ? `<div class="video-thumb-popup" style="display:none;">
                <div class="video-title">${titulo || 'Grabación'}</div>
                <img src="${thumbnailUrl}" alt="Miniatura de grabación">
              </div>`
            : ""
        }
      </span>
      <a href="${grabacion_url}" target="_blank" style="margin-left:8px;">Ver en Drive</a>
                `;
              })()
            : ""
        }
      `;

      timeSelectorsDiv.appendChild(div);

      if (grabacion_url && es_publico) {
        const trigger = div.querySelector('.video-thumb-trigger');
        const popup = div.querySelector('.video-thumb-popup');

        if (trigger && popup) {
          trigger.addEventListener('mouseenter', () => {
            popup.style.display = 'block';
          });
          trigger.addEventListener('mouseleave', () => {
            popup.style.display = 'none';
          });

          trigger.addEventListener('click', function(e) {
            if (popup) {
              e.preventDefault();
              popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
              document.addEventListener('click', function handler(ev) {
                if (!trigger.contains(ev.target)) {
                  popup.style.display = 'none';
                  document.removeEventListener('click', handler);
                }
              });
            }
          });
        }
      }
    });
  }, [isOwner]);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const date = DateTime.fromISO(dateString);
    return date.setLocale("es").toLocaleString({
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Cargar fechas cuando se selecciona un curso
  useEffect(() => {
    if (!calendarRef.current) return;

    // Simular fetch para obtener las fechas del curso seleccionado
    /*
    fetch(`/fechas/${courses[selectedCourseId].roomId}`)
      .then((res) => res.json())
      .then((fechas) => {
        if (!Array.isArray(fechas)) {
          alert("Error al cargar las fechas del servidor.");
          return;
        }

        const newDateEvents = {};
        const newHoursByDate = {};

        fechas.forEach((f) => {
          const startDate = DateTime.fromISO(f.fecha_inicial_utc).toLocal();
          const endDate = DateTime.fromISO(f.fecha_final_utc).toLocal();
          
          const date = startDate.toISODate();
          const start = startDate.toFormat("HH:mm");
          const end = endDate.toFormat("HH:mm");

          newDateEvents[date] = f.tipo;
          newHoursByDate[date] = {
            start,
            end,
            grabacion_url: f.grabacion_url,
            titulo: f.grabacion_titulo,
            es_publico: f.es_publico
          };
        });

        setDateEvents(newDateEvents);
        setHoursByDate(newHoursByDate);
        calendarRef.current.value = Object.keys(newDateEvents).join(" ");
        updateDisplay(newDateEvents, newHoursByDate);
      });
    */

    // Datos de ejemplo mientras no hay backend
    const exampleDateEvents = {
      "2024-06-15": "virtual",
      "2024-06-22": "aaa"
    };
    
    const exampleHoursByDate = {
      "2024-06-15": {
        start: "10:00",
        end: "12:00",
        grabacion_url: "https://drive.google.com/file/d/1abc123def456ghi789jkl/view",
        titulo: "Introducción a React",
        es_publico: true
      },
      "2024-06-22": {
        start: "14:00",
        end: "16:00",
        grabacion_url: null,
        titulo: null,
        es_publico: false
      }
    };

    setDateEvents(exampleDateEvents);
    setHoursByDate(exampleHoursByDate);
    calendarRef.current.value = Object.keys(exampleDateEvents).join(" ");
    updateDisplay(exampleDateEvents, exampleHoursByDate);

    // Establecer fecha mínima como hoy
    const today = DateTime.local().toISODate();
    calendarRef.current.setAttribute("min", today);
  }, [selectedCourseId, updateDisplay]);

  // Inicializar calendario
  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    const handleCalendarChange = () => {
      const selectedDates = calendar.value.split(" ").filter(Boolean);
      const newDateEvents = { ...dateEvents };

      selectedDates.forEach((date) => {
        if (!newDateEvents[date]) {
          newDateEvents[date] = currentEventType;
        }
      });

      Object.keys(newDateEvents).forEach((date) => {
        if (!selectedDates.includes(date)) {
          delete newDateEvents[date];
        }
      });

      setDateEvents(newDateEvents);
      updateDisplay(newDateEvents, hoursByDate);
    };

    calendar.addEventListener("change", handleCalendarChange);

    return () => {
      calendar.removeEventListener("change", handleCalendarChange);
    };
  }, [currentEventType, hoursByDate, updateDisplay, dateEvents]);

  const handleSave = () => {
    if (!isOwner) {
      return alert("No eres dueño de la sala");
    }
    
    const data = [];
    const userTimeZone = DateTime.local().zoneName;

    for (const date of Object.keys(dateEvents)) {
      const startInput = document.querySelector(`input[name="start-${date}"]`);
      const endInput = document.querySelector(`input[name="end-${date}"]`);
      const startLocal = startInput?.value || "";
      const endLocal = endInput?.value || "";

      if (!startLocal || !endLocal) {
        alert("Por favor, selecciona la hora de inicio y fin para todas las fechas.");
        return;
      }

      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startLocal) || 
          !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endLocal)) {
        alert("Formato de hora inválido. Use HH:mm (24 horas)");
        return;
      }

      if (startLocal >= endLocal) {
        alert(`La hora de inicio debe ser menor que la hora de fin para ${formatDate(date)}.`);
        return;
      }

      data.push({
        date,
        type: dateEvents[date],
        start: startLocal,
        end: endLocal,
        timeZone: userTimeZone
      });
    }

    // Comentado: Guardar en el servidor
    /*
    fetch("/fechas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fechas: data,
        selectedDates: data.map((d) => d.date),
        roomId: courses[selectedCourseId].roomId,
      }),
    })
      .then((res) => res.json())
      .then((resp) => {
        if (resp.success) {
          alert("Fechas guardadas correctamente");
        } else {
          alert("Error al guardar: " + (resp.error || ""));
        }
      })
      .catch(err => {
        console.error("Error al guardar:", err);
        alert("Error en la comunicación con el servidor");
      });
    */
    
    alert("Datos guardados correctamente (simulación)");
  };

  return (
    <div className="course-calendar-manager">
      <h1>Gestión de Sesiones por Curso</h1>
      
      {/* Botones de selección de curso */}
      <div className="course-buttons">
        {Object.entries(courses).map(([courseId, course]) => (
          <button
            key={courseId}
            className={`course-btn ${selectedCourseId === courseId ? 'active' : ''}`}
            onClick={() => setSelectedCourseId(courseId)}
          >
            {course.name}
          </button>
        ))}
      </div>
      
      <div className="extra-link">
        <a href="/rooms-form">Volver</a>
      </div>

      <div className="course-section">
        <h2>
          Proponer Horario de Clase <br />
          Curso: {courses[selectedCourseId].name}
        </h2>
        
        <div className="calendar-container">
          <calendar-multi 
            ref={calendarRef}
            months={2}
            value=""
          >
            <div className="grid">
              <calendar-month></calendar-month>
              <calendar-month offset={1}></calendar-month>
            </div>
          </calendar-multi>
        </div>
        
        <div className="button-container">
          <button 
            className={`btn ${currentEventType === 'virtual' ? 'btn-virtual selected' : 'btn-virtual'}`}
            onClick={() => setCurrentEventType('virtual')}
          >
            Clase Virtual
          </button>
          <button 
            className={`btn ${currentEventType === 'aaa' ? 'btn-aaa selected' : 'btn-aaa'}`}
            onClick={() => setCurrentEventType('aaa')}
          >
            Encuentros AAA
          </button>
        </div>
        
        <div id="timeSelectors" ref={timeSelectorsRef}></div>
        {isOwner && (
          <button id="saveButton" className="btn-save" onClick={handleSave}>
            Guardar
          </button>
        )}
      </div>
    </div>
  );
};

export default InstructorCal;