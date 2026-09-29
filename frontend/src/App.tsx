import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { QuantumExplainerModal } from './components/QuantumExplainerModal';

import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { FuelsPage } from './pages/FuelsPage';
import { MissionPlannerPage } from './pages/MissionPlannerPage';
import { FuelPredictionPage } from './pages/FuelPredictionPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        {/* Persistent Navigation Sidebar */}
        <Sidebar onOpenExplainer={() => setExplainerOpen(true)} />

        {/* Main Application Area */}
        <div className="gq-main-content flex-grow-1">
          <Navbar onOpenExplainer={() => setExplainerOpen(true)} />

          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/fuels" element={<FuelsPage />} />
              <Route path="/mission" element={<MissionPlannerPage />} />
              <Route path="/prediction" element={<FuelPredictionPage />} />
              <Route path="/optimization" element={<OptimizationPage />} />
              <Route path="/scenarios" element={<ScenariosPage />} />
              <Route path="/benchmark" element={<BenchmarkPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Quantum-Inspired Scientific Explainer Modal */}
        <QuantumExplainerModal
          isOpen={explainerOpen}
          onClose={() => setExplainerOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
