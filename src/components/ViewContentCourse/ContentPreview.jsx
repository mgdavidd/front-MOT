import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaExternalLinkAlt, FaPen } from "react-icons/fa";
import styles from "./ContentPreview.module.css";

const ContentPreview = ({ item, isRecording = false, shouldShowEditButtons, onEdit }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileTypeFromLink = (link) => {
    if (!link) return "unknown";
    const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return "unknown";
    if (isRecording) return "video";
    const title = item.titulo?.toLowerCase() || "";
    if (title.includes(".pdf")) return "pdf";
    if (title.includes(".doc") || title.includes(".docx")) return "document";
    if (title.includes(".xls") || title.includes(".xlsx")) return "spreadsheet";
    if (title.includes(".ppt") || title.includes(".pptx")) return "presentation";
    if (title.match(/\.(mp4|avi|webm|mov)$/)) return "video";
    if (title.match(/\.(jpg|jpeg|png|gif)$/)) return "image";
    if (title.match(/\.(mp3|wav|ogg)$/)) return "audio";
    return "document";
  };

  const getPreviewLink = (link, fileType) => {
    if (!link) return "";
    const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return link;
    const fileId = match[1];
    switch (fileType) {
      case "pdf":
      case "document":
      case "spreadsheet":
      case "presentation":
      case "video":
        return `https://drive.google.com/file/d/${fileId}/preview`;
      case "image":
        return `https://drive.google.com/uc?id=${fileId}`;
      default:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <span className={styles.fileIcon}>📄</span>;
      case "document":
        return <span className={styles.fileIcon}>📝</span>;
      case "spreadsheet":
        return <span className={styles.fileIcon}>📊</span>;
      case "presentation":
        return <span className={styles.fileIcon}>📽️</span>;
      case "video":
        return <span className={styles.fileIcon}>🎥</span>;
      case "image":
        return <span className={styles.fileIcon}>🖼️</span>;
      case "audio":
        return <span className={styles.fileIcon}>🎵</span>;
      default:
        return <span className={styles.fileIcon}>📎</span>;
    }
  };

  const fileType = getFileTypeFromLink(item.link);
  const previewLink = getPreviewLink(item.link, fileType);

  const renderPreview = () => {
    switch (fileType) {
      case "pdf":
      case "document":
      case "spreadsheet":
      case "presentation":
        return (
          <iframe
            src={previewLink}
            className={styles.previewFrame}
            title={`Preview ${item.titulo}`}
          />
        );
      case "video":
        return (
          <iframe
            src={previewLink}
            className={styles.previewFrame}
            title={`Video ${item.titulo}`}
            allow="autoplay"
          />
        );
      case "image":
        return <img src={previewLink} alt={item.titulo} className={styles.previewImage} />;
      default:
        return (
          <iframe
            src={previewLink}
            className={styles.previewFrame}
            title={`Preview ${item.titulo}`}
          />
        );
    }
  };

  return (
    <div className={styles.contentItem}>
      <div className={styles.header}>
        {getFileIcon(fileType)}
        <h3 className={styles.title}>{item.titulo}</h3>
      </div>

      {item.inicio && (
        <p className={styles.date}>
          Fecha: {new Date(item.inicio).toLocaleDateString("es-ES")}
        </p>
      )}

      <div className={styles.buttonGroup}>
        {/* 👁 Botón vista previa */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`${styles.iconButton} ${styles.previewBtn}`}
        >
          {showPreview ? <FaEyeSlash /> : <FaEye />}
        </button>

        {/* 🔗 Botón Drive */}
        <a
          href={item.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.iconButton} ${styles.driveBtn} ${
            !item.link ? styles.disabled : ""
          }`}
        >
          <FaExternalLinkAlt />
        </a>

        {/* ✏️ Botón editar */}
        {shouldShowEditButtons &&
          shouldShowEditButtons(isRecording ? "grabacion" : "contenido") && (
            <button
              onClick={() => onEdit(item, isRecording ? "grabacion" : "contenido")}
              className={`${styles.iconButton} ${styles.editBtn}`}
            >
              <FaPen />
            </button>
          )}
      </div>

      {showPreview && <div className={styles.previewContainer}>{renderPreview()}</div>}
    </div>
  );
};

const ContentList = ({ contenido, grabaciones, activeTab, shouldShowEditButtons, onEdit }) => {
  const items = activeTab === "contenido" ? contenido : grabaciones;
  const isRecording = activeTab === "grabaciones";
  if (items.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        {activeTab === "contenido"
          ? "Aún no hay contenido agregado."
          : "Aún no hay grabaciones disponibles."}
      </p>
    );
  }
  return (
    <div className={styles.list}>
      {items.map((item, index) => (
        <ContentPreview
          key={item.id || index}
          item={item}
          isRecording={isRecording}
          shouldShowEditButtons={shouldShowEditButtons}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default ContentList;
