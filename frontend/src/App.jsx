import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import DesktopLayout from './components/Layout/DesktopLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HirerDashboard from './pages/HirerDashboard';
import BidderDashboard from './pages/BidderDashboard';
import GigBidsPage from './pages/GigBidsPage';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';
import ProjectPipeline from './pages/ProjectPipeline';
import IncomingCallModal from './components/IncomingCallModal';
import { addNotification, setIncomingCall, fetchNotifications } from './redux/slices/notifications.slice';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const DashboardRouter = () => {
    const { user } = useSelector((state) => state.auth);
    if (user?.role === 'HIRER') return <HirerDashboard />;
    return <BidderDashboard />;
};

function App() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        dispatch(fetchNotifications(user.id));

        const stompClient = Stomp.over(() => new SockJS('http://localhost:8083/ws'));
        stompClient.debug = () => {}; // Silence debug logs
        
        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/notifications/${user.id}`, (msg) => {
                try {
                    const parsed = JSON.parse(msg.body);
                    const notif = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                    
                    // Dispatch to Redux for history
                    dispatch(addNotification({
                        ...notif,
                        id: notif.id || Date.now(),
                        createdAt: notif.createdAt || new Date().toISOString(),
                        isRead: false
                    }));

                    // Special handling for video calls
                    if (notif.type === 'VIDEO_CALL') {
                        dispatch(setIncomingCall({
                            callerId: notif.relatedId,
                            callerName: notif.callerName || 'Someone',
                            roomId: notif.roomId || `room-${notif.relatedId}`
                        }));
                    } else if (notif.type === 'CANCEL_CALL') {
                        dispatch(setIncomingCall(null));
                    }
                } catch (e) {
                    dispatch(addNotification({
                        message: msg.body,
                        type: 'INFO',
                        id: Date.now(),
                        createdAt: new Date().toISOString(),
                        isRead: false
                    }));
                }
            });
        });

        return () => {
            if (stompClient) stompClient.disconnect();
        };
    }, [isAuthenticated, user, dispatch]);

    return (
        <Router>
            <IncomingCallModal />
            <Routes>
                {/* Public Hero Page */}
                <Route path="/" element={<DesktopLayout><Home /></DesktopLayout>} />
                
                {/* Auth Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Dashboard Root */}
                <Route path="/dashboard/*" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <DashboardRouter />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />

                {/* Specific Gig Bids Page (Hirer Only) */}
                <Route path="/dashboard/gig/:gigId" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <GigBidsPage />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="/profile/:id" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <Profile />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />

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
                <Route path="/project/:gigId" element={
                    <ProtectedRoute>
                        <DesktopLayout>
                            <ProjectPipeline />
                        </DesktopLayout>
                    </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
