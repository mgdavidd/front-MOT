import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import Profile from './pages/Profile';
import Instructions from './pages/Instructions';
import InstructorNavBar from './pages/InstructorNavBar';
import ChecksKnowledge from './pages/ChecksKnowledge';
import OAuthSuccess from './pages/OauthSuccess';
import GoogleChooseUsername from './pages/GoogleChooseUsername';
import EditarPerfil from './pages/Personalizarperfil';
import CrearCurso from './pages/Crearcurso/CreateCourse';
import ModulesCourse from './pages/modulesCourse';
import ViewContentCourse from './pages/ViewContentCourse/ViewContentCourse';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/instructorNav" element={<InstructorNavBar />} />
        <Route path="/checksKnowledge" element={<ChecksKnowledge />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/choose-username" element={<GoogleChooseUsername />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/curso" element={<ModulesCourse />} />
        <Route path="/courseContent" element={<ViewContentCourse />} />
        <Route path="/crear-curso" element={<CrearCurso />} />


      </Routes>
    </div>
  );
}

export default App;
