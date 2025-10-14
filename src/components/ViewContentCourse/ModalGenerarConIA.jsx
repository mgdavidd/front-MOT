import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import styles from "./ModalGenerarConIA.module.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ModalGenerarConIA = ({ onClose, onGenerate }) => {
  const [mode, setMode] = useState("prompt");
  const [promptText, setPromptText] = useState("");
  const [processedFiles, setProcessedFiles] = useState([]);
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [dificultad, setDificultad] = useState("intermedio");
  const [notaMinima, setNotaMinima] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  const MAX_TEXT_LENGTH = 50000;

  const extractTextFromPDF = async (arrayBuffer) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }
      
      return fullText.trim();
    } catch (err) {
      console.error("Error en extractTextFromPDF:", err);
      throw new Error(`Error procesando PDF: ${err.message}`);
    }
  };

  const extractTextFromDOCX = async (arrayBuffer) => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (err) {
      throw new Error(`Error procesando DOCX: ${err.message}`);
    }
  };

  const extractTextFromExcel = (arrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      let fullText = "";
      
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        fullText += `\n--- Hoja: ${sheetName} ---\n${csv}\n`;
      });
      
      return fullText.trim();
    } catch (err) {
      throw new Error(`Error procesando Excel: ${err.message}`);
    }
  };

  const extractTextFromCSV = (text) =>
    new Promise((resolve, reject) => {
      Papa.parse(text, {
        complete: (results) => {
          const csv = results.data.map((row) => row.join(", ")).join("\n");
          resolve(csv.trim());
        },
        error: (err) => reject(new Error(`Error procesando CSV: ${err.message}`))
      });
    });

  const processFile = async (file) => {
    const id = `file-${Date.now()}-${Math.random()}`;
    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    // validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        id,
        titulo: fileName,
        text: "",
        status: "error",
        error: `Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(2)} MB (máx: 8 MB)`
      };
    }

    // validar extensiones
    const validExtensions = ["pdf", "txt", "docx", "doc", "xlsx", "xls", "csv", "md"];
    if (!validExtensions.includes(ext)) {
      return {
        id,
        titulo: fileName,
        text: "",
        status: "error",
        error: `Formato no soportado: .${ext}`
      };
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

      // Procesar según extension
      if (ext === "txt" || ext === "md") {
        extractedText = new TextDecoder().decode(arrayBuffer);
      } else if (ext === "pdf") {
        extractedText = await extractTextFromPDF(arrayBuffer);
      } else if (ext === "docx" || ext === "doc") {
        extractedText = await extractTextFromDOCX(arrayBuffer);
      } else if (ext === "xlsx" || ext === "xls") {
        extractedText = extractTextFromExcel(arrayBuffer);
      } else if (ext === "csv") {
        const csvText = new TextDecoder().decode(arrayBuffer);
        extractedText = await extractTextFromCSV(csvText);
      }

      // Limpiar texto con regex
      extractedText = extractedText
        .replace(/\s+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      
      if (!extractedText || extractedText.length < 30) {
        return {
          id,
          titulo: fileName,
          text: "",
          status: "error",
          error: "El archivo no contiene texto extraíble"
        };
      }

      return {
        id,
        titulo: fileName,
        text: extractedText,
        status: "success",
        error: null,
        size: extractedText.length
      };

    } catch (err) {
      console.error(`Error procesando ${fileName}:`, err);
      return {
        id,
        titulo: fileName,
        text: "",
        status: "error",
        error: err.message || "Error desconocido al procesar"
      };
    }
  };

  const handleFilesUpload = async (evt) => {
    const files = Array.from(evt.target.files || []);
    if (files.length === 0) return;

    setError("");
    
    //procesar cada archivo
    for (const file of files) {

      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setProcessedFiles(prev => [...prev, {
        id: tempId,
        titulo: file.name,
        text: "",
        status: "processing",
        error: null
      }]);

      // Procesar archivo
      const result = await processFile(file);
      
      // actualizar con el resultado
      setProcessedFiles(prev => 
        prev.map(f => f.id === tempId ? result : f)
      );
    }

    // Limpiar el input para poder subir el mismo archivo otra vez si es necesario
    evt.target.value = "";
  };

  const removeFile = (fileId) => {
    setProcessedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getCombinedText = () => {
    if (mode === "prompt") {
      return promptText.trim();
    }

    // Combinar texto de todos los archivos exitosos
    const successfulFiles = processedFiles.filter(f => f.status === "success");
    
    if (successfulFiles.length === 0) {
      return "";
    }

    let combined = successfulFiles
      .map(f => `\n\n=== ${f.titulo} ===\n${f.text}`)
      .join("");

    // Truncar si excede el límite
    if (combined.length > MAX_TEXT_LENGTH) {
      combined = combined.substring(0, MAX_TEXT_LENGTH) + "\n\n[...texto truncado por límite...]";
    }

    return combined.trim();
  };

  const handleGenerate = async () => {
    setError("");

    if (numPreguntas < 3 || numPreguntas > 25) {
      setError("Número de preguntas debe estar entre 3 y 25.");
      return;
    }

    const contexto = getCombinedText();

    if (!contexto) {
      if (mode === "prompt") {
        setError("Escribe el prompt para generar las preguntas.");
      } else {
        setError("Sube al menos un archivo con texto extraíble.");
      }
      return;
    }

    setLoading(true);
    try {
      await onGenerate({
        contexto,
        num_preguntas: numPreguntas,
        nivel_dificultad: dificultad,
        nota_minima: notaMinima,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error generando examen");
    } finally {
      setLoading(false);
    }
  };

  const getTotalChars = () => {
    return getCombinedText().length;
  };

  const getSuccessfulFilesCount = () => {
    return processedFiles.filter(f => f.status === "success").length;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>✨ Generar Examen con IA</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Selector de modo */}
          <div className={styles.section}>
            <h3>Modo de entrada</h3>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input 
                  type="radio" 
                  checked={mode === "prompt"} 
                  onChange={() => setMode("prompt")}
                  style={{ cursor: "pointer" }}
                />
                <span>Escribir prompt</span>
              </label>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input 
                  type="radio" 
                  checked={mode === "files"} 
                  onChange={() => setMode("files")}
                  style={{ cursor: "pointer" }}
                />
                <span>Subir archivos</span>
              </label>
            </div>
          </div>

          {/* Modo: Prompt */}
          {mode === "prompt" && (
            <div className={styles.section}>
              <h3>Escribe el contenido o tema</h3>
              <textarea
                className={styles.textPreview}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ejemplo: Crea preguntas sobre las leyes de Newton y sus aplicaciones en la física..."
                rows={10}
              />
              <p className={styles.charCount}>
                {promptText.length.toLocaleString()} caracteres
              </p>
            </div>
          )}

          {/* Modo: Archivos */}
          {mode === "files" && (
            <div className={styles.section}>
              <h3>Subir archivos</h3>
              <input 
                type="file" 
                multiple 
                onChange={handleFilesUpload}
                accept=".pdf,.docx,.doc,.txt,.md,.xlsx,.xls,.csv"
                style={{
                  padding: "0.75rem",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  width: "100%",
                  cursor: "pointer",
                  marginBottom: "1rem"
                }}
              />
              
              {processedFiles.length === 0 ? (
                <p className={styles.noFiles}>
                  No hay archivos subidos. Formatos: PDF, DOCX, TXT, XLSX, CSV, MD
                </p>
              ) : (
                <div className={styles.fileList}>
                  {processedFiles.map((f) => (
                    <div key={f.id} className={`${styles.fileItem} ${styles[f.status]}`}>
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{f.titulo}</span>
                        {f.status === "success" && (
                          <span className={styles.fileSize}>
                            {f.size.toLocaleString()} caracteres
                          </span>
                        )}
                        {f.status === "error" && (
                          <span className={styles.fileError}>{f.error}</span>
                        )}
                        {f.status === "processing" && (
                          <span className={styles.fileProcessing}>Procesando...</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFile(f.id)}
                        className={styles.removeBtn}
                        disabled={f.status === "processing"}
                        title="Eliminar archivo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {getSuccessfulFilesCount() > 0 && (
                <div className={styles.filesSummary}>
                  ✓ {getSuccessfulFilesCount()} archivo(s) procesado(s) • {getTotalChars().toLocaleString()} caracteres
                </div>
              )}
            </div>
          )}

          {/* Configuración */}
          <div className={styles.section}>
            <h3>Configuración del examen</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Número de preguntas:</label>
                <input
                  type="number"
                  min={3}
                  max={25}
                  value={numPreguntas}
                  onChange={(e) => setNumPreguntas(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dificultad:</label>
                <select 
                  value={dificultad} 
                  onChange={(e) => setDificultad(e.target.value)}
                  disabled={loading}
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Nota mínima:</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={notaMinima}
                  onChange={(e) => setNotaMinima(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && <div className={styles.error}>⚠️ {error}</div>}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancelar
          </button>
          <button 
            onClick={handleGenerate} 
            className={styles.generateBtn} 
            disabled={loading || !getCombinedText()}
          >
            {loading ? "Generando..." : "Generar Examen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGenerarConIA;