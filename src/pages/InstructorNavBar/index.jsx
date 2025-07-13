// InstructorNavBar.js
import React, { useState } from 'react';
import '../../assets/styles/instructorNavBar/index.css';
import { useNavigate } from 'react-router-dom';

function InstructorNavBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/profile')
  }
  
  const tabs = [
    { id: 'courses', label: 'Mis cursos' },
    { id: 'students', label: 'Estudiantes' },
    { id: 'calendar', label: 'Calendario' }
  ];

  return (
    <div className="instructor-dashboard">
      <header className="dashboard-header">
        <h1>My Online Tutor</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <button type="submit" className='profileButton'>
            <img src="../../../public/img/usuario.png" alt="" className="profileImg"/>
          </button>
        </form>
      </header>
      
      <div className="content-container">
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="tab-content">
          {activeTab === 'courses' && (
            <div className="content-section">
              <h2>Mis Cursos</h2>
              <div className="content-placeholder">
                {/* Karen y valeria */}
                <p>Contenido de Mis Cursos se mostrará en esta área</p>
              </div>
            </div>
          )}
          
          {activeTab === 'students' && (
            <div className="content-section">
              <h2>Estudiantes</h2>
              <div className="content-placeholder">
                {/* Yeisson */}
                <p>lista de estudiantes del curso</p>
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <div className="content-section">
              <h2>Calendario</h2>
              <div className="content-placeholder">
                {/* Yeisson con mi ayuda */}
                <p>Contenido de Calendario de todos los cursos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorNavBar;