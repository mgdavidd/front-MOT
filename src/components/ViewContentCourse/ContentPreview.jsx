import React, { useState } from 'react';

const ContentPreview = ({ item, isRecording = false, shouldShowEditButtons, onEdit }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getFileTypeFromLink = (link) => {
    if (!link) return 'unknown';
    const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return 'unknown';
    if (isRecording) return 'video';
    const title = item.titulo?.toLowerCase() || '';
    if (title.includes('.pdf')) return 'pdf';
    if (title.includes('.doc') || title.includes('.docx')) return 'document';
    if (title.includes('.xls') || title.includes('.xlsx')) return 'spreadsheet';
    if (title.includes('.ppt') || title.includes('.pptx')) return 'presentation';
    if (title.includes('.mp4') || title.includes('.avi') || title.includes('.webm') || title.includes('.mov')) return 'video';
    if (title.includes('.jpg') || title.includes('.jpeg') || title.includes('.png') || title.includes('.gif')) return 'image';
    if (title.includes('.mp3') || title.includes('.wav') || title.includes('.ogg')) return 'audio';
    return 'document';
  };

  const getPreviewLink = (link, fileType) => {
    if (!link) return '';
    const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return link;
    const fileId = match[1];
    switch (fileType) {
      case 'pdf':
      case 'document':
      case 'spreadsheet':
      case 'presentation':
      case 'video':
        return `https://drive.google.com/file/d/${fileId}/preview`;
      case 'image':
        return `https://drive.google.com/uc?id=${fileId}`;
      default:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  };

  const getFileIcon = (fileType) => {
    const iconStyle = { width: '24px', height: '24px', marginRight: '8px' };
    switch (fileType) {
      case 'pdf': return <span style={{...iconStyle, color: '#d32f2f'}}>📄</span>;
      case 'document': return <span style={{...iconStyle, color: '#1976d2'}}>📝</span>;
      case 'spreadsheet': return <span style={{...iconStyle, color: '#388e3c'}}>📊</span>;
      case 'presentation': return <span style={{...iconStyle, color: '#f57c00'}}>📽️</span>;
      case 'video': return <span style={{...iconStyle, color: '#e91e63'}}>🎥</span>;
      case 'image': return <span style={{...iconStyle, color: '#9c27b0'}}>🖼️</span>;
      case 'audio': return <span style={{...iconStyle, color: '#673ab7'}}>🎵</span>;
      default: return <span style={{...iconStyle, color: '#757575'}}>📎</span>;
    }
  };

  const fileType = getFileTypeFromLink(item.link);
  const previewLink = getPreviewLink(item.link, fileType);

  const renderPreview = () => {
    switch (fileType) {
      case 'pdf':
      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return <iframe src={previewLink} style={{width:'100%',height:'500px',border:'none'}} title={`Preview ${item.titulo}`} />;
      case 'video':
        return <iframe src={previewLink} style={{width:'100%',height:'450px',border:'none'}} title={`Video ${item.titulo}`} allow="autoplay" />;
      case 'image':
        return <img src={previewLink} alt={item.titulo} style={{maxWidth:'100%',maxHeight:'500px',objectFit:'contain'}} />;
      default:
        return <iframe src={previewLink} style={{width:'100%',height:'500px',border:'none'}} title={`Preview ${item.titulo}`} />;
    }
  };

  return (
    <div style={{marginBottom:'16px',padding:'16px',border:'1px solid #e0e0e0',borderRadius:'8px',background:'#fafafa'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        {getFileIcon(fileType)}
        <h3 style={{margin:0,flex:1}}>{item.titulo}</h3>
      </div>

      {item.inicio && (
        <p style={{margin:'8px 0',color:'#666',fontSize:'14px'}}>
          Fecha: {new Date(item.inicio).toLocaleDateString('es-ES')}
        </p>
      )}

      <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
        <button onClick={() => setShowPreview(!showPreview)} style={{padding:'8px 16px',background:'#1976d2',color:'white',border:'none',borderRadius:'4px'}}>
          {showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
        </button>
        <a href={item.link||'#'} target="_blank" rel="noopener noreferrer" style={{
          padding:'8px 16px',background:item.link?'#388e3c':'#ccc',
          color:'white',textDecoration:'none',borderRadius:'4px',
          cursor:item.link?'pointer':'not-allowed'
        }}>{item.link?'Abrir en Drive':'Sin enlace'}</a>
        {shouldShowEditButtons && shouldShowEditButtons(isRecording ? "grabacion" : "contenido") && (
          <button
            onClick={() => onEdit(item, isRecording ? "grabacion" : "contenido")}
            style={{padding:'8px 16px',background:'#f57c00',color:'white',border:'none',borderRadius:'4px'}}
          >
            Editar
          </button>
        )}
      </div>

      {showPreview && <div style={{marginTop:'16px'}}>{renderPreview()}</div>}
    </div>
  );
};

const ContentList = ({ contenido, grabaciones, activeTab, shouldShowEditButtons, onEdit }) => {
  const items = activeTab === 'contenido' ? contenido : grabaciones;
  const isRecording = activeTab === 'grabaciones';
  if (items.length === 0) {
    return <p style={{textAlign:'center',color:'#666',padding:'32px'}}>
      {activeTab==='contenido'?'Aún no hay contenido agregado.':'Aún no hay grabaciones disponibles.'}
    </p>;
  }
  return (
    <div>
      {items.map((item,index) => (
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
