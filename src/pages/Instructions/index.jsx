import React, { useState } from "react";
import '../../assets/styles/instructions/instructions.css';

const Instructions = () => {
  const [hasRead, setHasRead] = useState(false);

  const handleCheckboxChange = (e) => {
    setHasRead(e.target.checked);
  };

  const handleContinue = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div className="centered-page">
      <div className="instrucciones-admin-container">
        <h1>¡Bienvenido, Docente!</h1>
        <p>Antes de comenzar, por favor lee atentamente estas indicaciones:</p>
        <ul>
          <li>Solo usted puede grabar y gestionar las sesiones.</li>
          <li>
            A la hora de hacer las sesiones, asegúrese de tener una buena
            conexión a Internet y sin Firewalls que puedan interferir.
          </li>
          <li>
            Al iniciar una sesión, seleccione la vista a grabar; esta no podrá
            cambiarse hasta finalizar la grabación.
          </li>
          <li>
            Verifique que su cuenta de Google Drive de uso academico cuente con el espacio necesario para la subida de contenido
          </li>
          <li>No comparta su cuenta de administrador o archivos relacionados con su curso con terceros.</li>
          <li>
            no subir contenido explicito o que viole las políticas de uso de la plataforma.
          </li>
          <li>
            cuide sus datos personales en cada sesion y no comparta información sensible.
          </li>
        </ul>

        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={hasRead}
              onChange={handleCheckboxChange}
            />
            He leído y comprendido las instrucciones
          </label>
        </div>

        <button
          id="continuar-btn"
          disabled={!hasRead}
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default Instructions;
