import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router';
import { getCurrentUser, setCurrentUser, User, mockNotifications } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { clearAuthTokens, loginUser, logoutUser } from './services/auth';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { HackathonsPage } from './pages/student/HackathonsPage';
import { HackathonDetailPage } from './pages/student/HackathonDetailPage';
import { TeamManagementPage } from './pages/student/TeamManagementPage';
import { ProblemSelectionPage } from './pages/student/ProblemSelectionPage';
import { Round1SubmissionPage } from './pages/student/Round1SubmissionPage';
import { Round1LeaderboardPage } from './pages/student/Round1LeaderboardPage';
import { MentorSelectionPage } from './pages/student/MentorSelectionPage';
import { CampusEventPage } from './pages/student/CampusEventPage';
import { FinalSubmissionPage } from './pages/student/FinalSubmissionPage';
import { FinalLeaderboardPage } from './pages/student/FinalLeaderboardPage';
import { GlobalLeaderboardPage } from './pages/student/GlobalLeaderboardPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHackathonDetailPage } from './pages/admin/AdminHackathonDetailPage';
import { VerificationsPage } from './pages/admin/VerificationsPage';
import { CoreConfigPage } from './pages/admin/index';
import { ManageHackathonsPage } from './pages/admin/ManageHackathonsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import {
  ProblemsManagementPage,
  MentorsManagementPage,
  Round1EvaluationPage,
  FinalEvaluationPage,
  QRManagementPage,
  AttendancePage,
  FoodAnalyticsPage,
  BroadcastPage,
  CertificatesPage,
  EventSummaryPage,
} from './pages/admin';


function RegisterPageWrapper({ role }: { role: 'student' | 'admin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
  const cameFromLanding = from === 'landing';

  return (
    <RegisterPage
      role={role}
      backTo={cameFromLanding ? 'landing' : 'login'}
      onBack={() => navigate(cameFromLanding ? '/' : `/login/${role}`)}
      onRegistered={() => navigate(`/login/${role}`)}
    />
  );
}

function AdminHackathonDetailWrapper() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  return <AdminHackathonDetailPage hackathonId={hackathonId || ''} />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(
    localStorage.getItem('selectedHackathonId')
  );
  const navigate = useNavigate();
  const location = useLocation();
  const activeHackathonMatch = location.pathname.match(/^\/student\/hackathon\/([^/]+)/);
  const activeHackathonId = activeHackathonMatch?.[1] || selectedHackathonId;

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (activeHackathonMatch?.[1] && activeHackathonMatch[1] !== selectedHackathonId) {
      setSelectedHackathonId(activeHackathonMatch[1]);
      localStorage.setItem('selectedHackathonId', activeHackathonMatch[1]);
    }
  }, [activeHackathonMatch, selectedHackathonId]);

  useEffect(() => {
    const isPrivateRoute =
      location.pathname.startsWith('/student') || location.pathname.startsWith('/admin');

    if (!user && isPrivateRoute) {
      navigate('/', { replace: true });
      return;
    }

    if (!user) {
      return;
    }

    if (location.pathname.startsWith('/student') && user.role !== 'student') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [location.pathname, navigate, user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentUser(loggedInUser);
    navigate(loggedInUser.role === 'student' ? '/student/dashboard' : '/admin/dashboard');
  };

  const handleCredentialLogin = async (
    email: string,
    password: string,
    expectedRole: 'student' | 'admin'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const loggedInUser = await loginUser(email, password);

      const roleMatches =
        expectedRole === 'admin'
          ? loggedInUser.role === 'admin' || loggedInUser.role === 'scanner'
          : loggedInUser.role === 'student';

      if (!roleMatches) {
        clearAuthTokens();
        return { success: false, message: `This account is not a ${expectedRole} account` };
      }

      const uiRole = loggedInUser.role === 'scanner' ? 'admin' : loggedInUser.role;

      handleLogin({
        id: loggedInUser._id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        role: uiRole as 'student' | 'admin',
        hackScore: 0,
        verified: true,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login right now';
      return { success: false, message };
    }
  };

  const handleLogout = async () => {
    if (user?.id) {
      await logoutUser(user.id);
    } else {
      clearAuthTokens();
    }
    setCurrentUser(null);
    setUser(null);
    navigate('/');
  };

  const handleSelectHackathon = (hackathonId: string) => {
    setSelectedHackathonId(hackathonId);
    localStorage.setItem('selectedHackathonId', hackathonId);
    navigate(`/student/hackathon/${hackathonId}`);
  };

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register');
  const showAppChrome = !!user && !isPublicPage;

  const requireStudent = (element: JSX.Element) =>
    user?.role === 'student' ? element : <Navigate to="/" replace />;
  const requireAdmin = (element: JSX.Element) =>
    user?.role === 'admin' ? element : <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] dark">
      {showAppChrome && (
        <Navbar
          user={user}
          onLogout={handleLogout}
          notificationCount={mockNotifications.filter(n => !n.read).length}
        />
      )}

      <div className={showAppChrome ? 'flex' : ''}>
        {showAppChrome && (
          <Sidebar
            role={user.role}
            currentPage={location.pathname}
            onNavigate={(page: string) => navigate(page)}
          />
        )}

        <main className={showAppChrome ? 'flex-1 mt-16 ml-0 md:ml-64 p-6' : ''}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <LandingPage
                  onStudentLogin={() => navigate('/login/student')}
                  onAdminLogin={() => navigate('/login/admin')}
                  onStudentRegister={() => navigate('/register/student', { state: { from: 'landing' } })}
                  onAdminRegister={() => navigate('/register/admin', { state: { from: 'landing' } })}
                />
              }
            />
            <Route
              path="/login/student"
              element={
                <LoginPage
                  onLogin={(email, password) => handleCredentialLogin(email, password, 'student')}
                  onBack={() => navigate('/')}
                  onNavigateToRegister={() => navigate('/register/student', { state: { from: 'login' } })}
                  initialRole="student"
                />
              }
            />
            <Route
              path="/login/admin"
              element={
                <LoginPage
                  onLogin={(email, password) => handleCredentialLogin(email, password, 'admin')}
                  onBack={() => navigate('/')}
                  onNavigateToRegister={() => navigate('/register/admin', { state: { from: 'login' } })}
                  initialRole="admin"
                />
              }
            />
            <Route
              path="/register/student"
              element={<RegisterPageWrapper role="student" />}
            />
            <Route
              path="/register/admin"
              element={<RegisterPageWrapper role="admin" />}
            />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={requireStudent(<StudentDashboard onNavigateToHackathon={handleSelectHackathon} />)}
            />
            <Route
              path="/student/hackathons"
              element={requireStudent(<HackathonsPage onSelectHackathon={handleSelectHackathon} />)}
            />
            <Route
              path="/student/hackathon/:hackathonId"
              element={requireStudent(
                <HackathonDetailPage
                  hackathonId={activeHackathonId || undefined}
                  onBack={() => navigate('/student/hackathons')}
                  onMyTeam={() => activeHackathonId && navigate(`/student/hackathon/${activeHackathonId}/team`)}
                  onRound1Details={() => activeHackathonId && navigate(`/student/hackathon/${activeHackathonId}/round1-submission`)}
                  onMentorSelection={() => activeHackathonId && navigate(`/student/hackathon/${activeHackathonId}/mentor-selection`)}
                  onCampusEvent={() => activeHackathonId && navigate(`/student/hackathon/${activeHackathonId}/campus-event`)}
                  onFinalSubmission={() => activeHackathonId && navigate(`/student/hackathon/${activeHackathonId}/final-submission`)}
                />
              )}
            />
            <Route path="/student/hackathon/:hackathonId/team" element={requireStudent(<TeamManagementPage />)} />
            <Route path="/student/hackathon/:hackathonId/problems" element={requireStudent(<ProblemSelectionPage />)} />
            <Route path="/student/hackathon/:hackathonId/round1-submission" element={requireStudent(<Round1SubmissionPage />)} />
            <Route path="/student/hackathon/:hackathonId/round1-selection" element={requireStudent(<Round1SubmissionPage />)} />
            <Route path="/student/hackathon/:hackathonId/round1-leaderboard" element={requireStudent(<Round1LeaderboardPage />)} />
            <Route path="/student/hackathon/:hackathonId/mentor-selection" element={requireStudent(<MentorSelectionPage />)} />
            <Route path="/student/hackathon/:hackathonId/campus-event" element={requireStudent(<CampusEventPage />)} />
            <Route path="/student/hackathon/:hackathonId/final-submission" element={requireStudent(<FinalSubmissionPage />)} />
            <Route path="/student/hackathon/:hackathonId/final-leaderboard" element={requireStudent(<FinalLeaderboardPage />)} />
            <Route
              path="/student/team"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/team` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/problems"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/problems` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/round1-submission"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/round1-submission` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/round1-selection"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/round1-selection` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/round1-leaderboard"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/round1-leaderboard` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/mentor-selection"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/mentor-selection` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/campus-event"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/campus-event` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/final-submission"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/final-submission` : '/student/hackathons'} replace />}
            />
            <Route
              path="/student/final-leaderboard"
              element={<Navigate to={activeHackathonId ? `/student/hackathon/${activeHackathonId}/final-leaderboard` : '/student/hackathons'} replace />}
            />
            <Route path="/student/global-leaderboard" element={requireStudent(<GlobalLeaderboardPage />)} />
            <Route path="/student/profile" element={requireStudent(<ProfilePage user={user} />)} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={requireAdmin(<AdminDashboard />)}
            />
            <Route
              path="/admin/hackathon/:hackathonId"
              element={requireAdmin(<AdminHackathonDetailWrapper />)}
            />
            {/* Admin sub-pages (accessed from hackathon detail) */}
            <Route path="/admin/hackathon/:hackathonId/manage" element={requireAdmin(<ManageHackathonsPage />)} />
            <Route path="/admin/hackathon/:hackathonId/problems" element={requireAdmin(<ProblemsManagementPage />)} />
            <Route path="/admin/hackathon/:hackathonId/mentors" element={requireAdmin(<MentorsManagementPage />)} />
            <Route path="/admin/hackathon/:hackathonId/round1-eval" element={requireAdmin(<Round1EvaluationPage />)} />
            <Route path="/admin/hackathon/:hackathonId/verification" element={requireAdmin(<VerificationsPage />)} />
            <Route path="/admin/hackathon/:hackathonId/qr" element={requireAdmin(<QRManagementPage />)} />
            <Route path="/admin/hackathon/:hackathonId/food" element={requireAdmin(<FoodAnalyticsPage />)} />
            <Route path="/admin/hackathon/:hackathonId/broadcast" element={requireAdmin(<BroadcastPage />)} />
            <Route path="/admin/hackathon/:hackathonId/final-eval" element={requireAdmin(<FinalEvaluationPage />)} />
            <Route path="/admin/hackathon/:hackathonId/certificates" element={requireAdmin(<CertificatesPage />)} />
            <Route path="/admin/hackathon/:hackathonId/attendance" element={requireAdmin(<AttendancePage />)} />
            <Route path="/admin/hackathon/:hackathonId/summary" element={requireAdmin(<EventSummaryPage />)} />
            <Route
              path="/admin/hackathon/:hackathonId/config"
              element={requireAdmin(<CoreConfigPage />)}
            />
            <Route path="/admin/profile" element={requireAdmin(<AdminProfilePage user={user} />)} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
