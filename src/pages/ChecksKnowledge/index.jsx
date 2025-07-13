import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/checksKnowledge/index.css';

const ChecksKnowledge = () => {
  const location = useLocation();
  const userName = location.state?.userName || "";
  const [file, setFile] = useState(null);
  const [area, setArea] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAreaChange = (e) => {
    setArea(e.target.value);
  };

  const handleVerify = async () => {
    if (file && area) {
      fetch("http://localhost:3000/updateArea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area,
          userName
        }),
      });
      console.log("Área seleccionada:", area);
      navigate('/instructions');
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Portal para Docentes <br/>{userName}</h1>
      <p className="home-description">
        Sube tu hoja de vida y verifica tus conocimientos para ser parte de nuestra red educativa.
      </p>

      <div className="file-upload">
        <label htmlFor="cvUpload" className="upload-label">
          Seleccionar hoja de vida (PDF)
        </label>
        <input
          type="file"
          id="cvUpload"
          accept=".pdf"
          onChange={handleFileChange}
        />
        {file && <p className="file-name">📄 {file.name}</p>}
      </div>

      <div className="select-area">
        <label htmlFor="areaSelect" className="upload-label">
          Selecciona tu área de especialización
        </label>
        <select id="areaSelect" value={area} onChange={handleAreaChange} required>
          <option value="">-- Selecciona un área --</option>
          <option value="Tecnología y Programación">Tecnología y Programación</option>
          <option value="Negocios y Marketing">Negocios y Marketing</option>
          <option value="Diseño y Creatividad">Diseño y Creatividad</option>
          <option value="Idiomas">Idiomas</option>
          <option value="Ciencias y Matemáticas">Ciencias y Matemáticas</option>
          <option value="Educación y Pedagogía">Educación y Pedagogía</option>
        </select>
      </div>

      <button
        className="home-button"
        onClick={handleVerify}
        disabled={!file || !area}
      >
        Verificar
      </button>
    </div>
  );
};

export default ChecksKnowledge;
