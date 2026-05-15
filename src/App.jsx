// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/home/HomePage';
import RitmicaPage from './pages/disciplines/RitmicaPage';
import AcrobaticaPage from './pages/disciplines/AcrobaticaPage';
import TrampolinPage from './pages/disciplines/TrampolinPage';
import OpenRitmica from './pages/events/OpenRitmica';
import OpenAcrobatica from './pages/events/OpenAcrobatica';
import CatalogoPage from './pages/more/CatalogoPage';
import CalendarioPage from './pages/more/CalendarioPage';
import LoginPage from './pages/more/LoginPage';
import DashboardPage from './pages/more/DashboardPage';
import CampPage from './pages/camp/CampPage';
import RegistrationsPage from './pages/admin/RegistrationsPage';
import CalendarAdminPage from './pages/admin/CalendarAdminPage';
import HeroSlidesAdminPage from './pages/admin/HeroSlidesAdminPage';
import RequireAuth from './components/auth/RequireAuth';


// Placeholder pages (you'll replace these with real ones)
const Placeholder = ({ title }) => (
  <div style={{ padding: '4rem 0', textAlign: 'center' }}>
    <h2>{title} Page</h2>
    <p>En construcción</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* All routes inside here will have Header and Footer */}
        <Route path="/" element={<HomePage />} />
        <Route path="/ritmica" element={<RitmicaPage title="Rítmica" />} />
        <Route path="/acrobatica" element={<AcrobaticaPage title="Acrobática" />} />
        <Route path="/trampolin" element={<TrampolinPage title="Trampolín" />} />
        <Route path="/catalogo" element={<CatalogoPage title="Catálogo" />} />
        <Route path="/calendario" element={<CalendarioPage title="Calendario" />} />
        <Route path="/open-ritmica" element={<OpenRitmica title="Open Rítmica" />} />
        <Route path="/open-acrobatica" element={<OpenAcrobatica title="Open Acrobática" />} />
        <Route path="/campamento" element={<CampPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes: only signed-in users can access these */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Staff-only routes */}
        <Route element={<RequireAuth roles={['admin', 'coach']} />}>
          <Route
            path="/admin/inscricions"
            element={<RegistrationsPage />}
          />
          <Route
            path="/admin/calendario"
            element={<CalendarAdminPage />}
          />
          <Route
            path="/admin/hero"
            element={<HeroSlidesAdminPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;