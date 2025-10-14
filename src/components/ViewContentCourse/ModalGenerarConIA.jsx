import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import styles from "./ModalGenerarConIA.module.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ModalGenerarConIA = ({ onClose, onGenerate }) => {
  const [mode, setMode] = useState("prompt");
  const [promptText, setPromptText] = useState("");
  const [localFiles, setLocalFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [dificultad, setDificultad] = useState("intermedio");
  const [notaMinima, setNotaMinima] = useState(7);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB local limit
  const MAX_TEXT_LENGTH = 50000;

  const handleLocalUpload = (evt) => {
    const files = Array.from(evt.target.files || []);
    const mapped = files.map((f, i) => {
      const ext = (f.name || "").split(".").pop().toLowerCase();
      return { id: `local-${Date.now()}-${i}`, file: f, titulo: f.name, ext };
    });
    setLocalFiles((prev) => [...prev, ...mapped]);
    // auto-select newly added
    setSelectedFiles((prev) => [...prev, ...mapped.map((m) => m.id)]);
  };

  const toggleFile = (id) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const extractTextFromPDF = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    return fullText;
  };

  const extractTextFromDOCX = async (arrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromExcel = (arrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    let fullText = "";
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      fullText += `\n--- Hoja: ${sheetName} ---\n${csv}\n`;
    });
    return fullText;
  };

  const extractTextFromCSV = (text) =>
    new Promise((resolve) => {
      Papa.parse(text, {
        complete: (results) => {
          const csv = results.data.map((row) => row.join(", ")).join("\n");
          resolve(csv);
        },
      });
    });

  const extractTextFromLocalFile = async (local) => {
    try {
      if (local.file.size > MAX_FILE_SIZE) {
        return `[Archivo ${local.titulo} demasiado grande]`;
      }
      const arrayBuffer = await local.file.arrayBuffer();
      const ext = local.ext;
      if (ext === "txt" || ext === "md") {
        return new TextDecoder().decode(arrayBuffer);
      }
      switch (ext) {
        case "pdf":
          return await extractTextFromPDF(arrayBuffer);
        case "docx":
        case "doc":
          return await extractTextFromDOCX(arrayBuffer);
        case "xlsx":
        case "xls":
          return extractTextFromExcel(arrayBuffer);
        case "csv": {
          const csvText = new TextDecoder().decode(arrayBuffer);
          return await extractTextFromCSV(csvText);
        }
        default:
          return `[Formato local no soportado: .${ext}]`;
      }
    } catch (err) {
      console.error("Error extrayendo local:", err);
      return `[Error extrayendo ${local.titulo}: ${err.message}]`;
    }
  };

  const handleExtractSelected = async () => {
    if (selectedFiles.length === 0) {
      setError("Selecciona al menos un archivo para extraer.");
      return;
    }
    setExtracting(true);
    setError("");
    setProgress("Procesando archivos...");
    try {
      const chosen = localFiles.filter((f) => selectedFiles.includes(f.id));
      let combined = "";
      for (let i = 0; i < chosen.length; i++) {
        const f = chosen[i];
        setProgress(`Procesando ${i + 1}/${chosen.length}: ${f.titulo}`);
        const text = await extractTextFromLocalFile(f);
        combined += `\n\n=== ${f.titulo} ===\n${text}`;
      }
      combined = combined.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      if (combined.length > MAX_TEXT_LENGTH) {
        combined = combined.substring(0, MAX_TEXT_LENGTH) + "\n\n[...texto truncado...]";
      }
      setExtractedText(combined);
      setProgress(`✓ ${chosen.length} archivo(s) procesado(s)`);
    } catch (err) {
      setError("Error extrayendo archivos: " + (err.message || err));
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    if (numPreguntas < 3 || numPreguntas > 25) {
      setError("Número de preguntas debe estar entre 3 y 25.");
      return;
    }

    let contexto = "";
    if (mode === "prompt") {
      if (!promptText.trim()) {
        setError("Escribe el prompt para generar las preguntas.");
        return;
      }
      contexto = promptText.trim();
    } else {
      if (!extractedText.trim()) {
        setError("Extrae texto de los archivos antes de generar.");
        return;
      }
      contexto = extractedText;
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
          <div className={styles.section}>
            <h3>Modo</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <label>
                <input type="radio" checked={mode === "prompt"} onChange={() => setMode("prompt")} />
                Escribe lo que quieres
              </label>
              <label>
                <input type="radio" checked={mode === "files"} onChange={() => setMode("files")} />
                subir Archivos
              </label>
            </div>
          </div>

          {mode === "prompt" && (
            <div className={styles.section}>
              <h3>Escribe el prompt</h3>
              <textarea
                className={styles.textPreview}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Describe el contenido o instrucciones para la IA..."
                rows={8}
              />
            </div>
          )}

          {mode === "files" && (
            <div className={styles.section}>
              <h3>Subir archivos locales</h3>
              <input type="file" multiple onChange={handleLocalUpload} disabled={extracting} />
              {localFiles.length === 0 ? (
                <p className={styles.noFiles}>No hay archivos subidos.</p>
              ) : (
                <div className={styles.fileList}>
                  {localFiles.map((f) => (
                    <label key={f.id} className={styles.fileItem}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(f.id)}
                        onChange={() => toggleFile(f.id)}
                        disabled={extracting}
                      />
                      <span className={styles.fileName}>{f.titulo}</span>
                      <span className={styles.fileExt}>{f.ext ? `.${f.ext.toUpperCase()}` : ""}</span>
                    </label>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={handleExtractSelected}
                  disabled={extracting || selectedFiles.length === 0}
                  className={styles.extractBtn}
                >
                  {extracting ? "Extrayendo..." : "Extraer texto de archivos"}
                </button>
                {progress && <div style={{ marginTop: 8 }}>{progress}</div>}
                {extractedText && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#444",
                    }}
                  >
                    {extractedText.slice(0, 300)}
                    {extractedText.length > 300 ? "..." : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h3>Configuración</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Número de preguntas:</label>
                <input
                  type="number"
                  min={3}
                  max={25}
                  value={numPreguntas}
                  onChange={(e) => setNumPreguntas(Number(e.target.value))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dificultad:</label>
                <select value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
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
          <button onClick={handleGenerate} className={styles.generateBtn} disabled={loading}>
            {loading ? "Generando..." : "🪄 Generar Examen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGenerarConIA;