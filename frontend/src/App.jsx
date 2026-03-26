import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DesktopLayout from './components/Layout/DesktopLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Hero Page */}
                <Route path="/" element={<DesktopLayout><Home /></DesktopLayout>} />
                
                {/* Auth Pages (No layout wrapper) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Dashboard */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <Dashboard />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />
                
                {/* Profile Page - accessible to logged-in users */}
                <Route path="/profile/:id" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <Profile />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />

                {/* Communication Pages - full screen, no layout chrome */}
                <Route path="/chat/:bidderId" element={
                    <ProtectedRoute>
                        <Chat />
                    </ProtectedRoute>
                } />
                <Route path="/video-call/:bidderId" element={
                    <ProtectedRoute>
                        <VideoCall />
                    </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
