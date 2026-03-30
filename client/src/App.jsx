import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './views/components/Navbar';
import PrivateRoute from './views/components/PrivateRoute';
import Login from './views/pages/Login';
import Register from './views/pages/Register';
import Dashboard from './views/pages/Dashboard';
import WorkspacePage from './views/pages/WorkspacePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<><Navbar /><main><Login /></main></>} />
        <Route path="/register" element={<><Navbar /><main><Register /></main></>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <main>
                <Dashboard />
              </main>
            </PrivateRoute>
          }
        />
        <Route
          path="/workspace"
          element={
            <PrivateRoute>
              <WorkspacePage />
            </PrivateRoute>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
