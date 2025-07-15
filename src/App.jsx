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
        <Route path="/curso" element={<ViewContentCourse />} />
      </Routes>
    </div>
  );
}

export default App;
