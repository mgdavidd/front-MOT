import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import Instructions from './pages/Instructions';
import InstructorNavBar from './pages/InstructorNavBar';
import ChecksKnowledge from './pages/ChecksKnowledge';
import OAuthSuccess from './pages/OauthSuccess';
import GoogleChooseUsername from './pages/GoogleChooseUsername';
import EditarPerfil from './pages/Personalizarperfil';
import CrearCurso from './pages/Crearcurso/CreateCourse';
import ViewContentCourse from './pages/ViewContentCourse/ViewContentCourse';
import ModulesCourse from './pages/ModulesCourse';
import Chatcourse from './pages/Chatcourse/Chatcourse';
import StudentNavBar from './pages/StudentNavBar/StudentNavBar';
import PrivateChat from './pages/Chatcourse/PrivateChat';
import MyChats from './pages/MyChats/Mychats';
import ForumModule from './pages/forum/ForumModule';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/instructorNav" element={<InstructorNavBar />} />
        <Route path="/checksKnowledge" element={<ChecksKnowledge />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/choose-username" element={<GoogleChooseUsername />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/curso" element={<ModulesCourse />} />
        <Route path="/viewContent" element={<ViewContentCourse />} />
        <Route path="/crear-curso" element={<CrearCurso />} />
        <Route path="/course-chat/:courseId" element={<Chatcourse />} />
        <Route path="/StudentNav" element={<StudentNavBar />} />
        <Route path="/private-chat/:otherUserId" element={<PrivateChat />} />
        <Route path="/mychats" element={<MyChats/>} />
        <Route path="/forum" element={<ForumModule/>} />

      </Routes>
    </div>
  );
}

export default App;
