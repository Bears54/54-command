import React, { useState } from 'react';
import { BinderProvider, useBinder } from './context/BinderContext';
import { BinderSidebar } from './components/layout/BinderSidebar';
import { BinderHeader } from './components/layout/BinderHeader';
import { GeminiAssistantDrawer } from './components/assistant/GeminiAssistantDrawer';

// Pages
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { PlannerPage } from './components/pages/PlannerPage';
import { KanbanPage } from './components/pages/KanbanPage';
import { HabitsPage } from './components/pages/HabitsPage';
import { FinancePage } from './components/pages/FinancePage';
import { CleaningPage } from './components/pages/CleaningPage';
import { WellnessPage } from './components/pages/WellnessPage';
import { MealPlanningPage } from './components/pages/MealPlanningPage';
import { HomeProjectsPage } from './components/pages/HomeProjectsPage';
import { WatchlistPage } from './components/pages/WatchlistPage';
import { PhotoAlbumsPage } from './components/pages/PhotoAlbumsPage';
import { OfflineMusicPage } from './components/pages/OfflineMusicPage';
import { ContactsPage } from './components/pages/ContactsPage';
import { NotesPage } from './components/pages/NotesPage';
import { DocumentHubPage } from './components/pages/DocumentHubPage';
import { SetupPage } from './components/pages/SetupPage';
import { CustomPageView } from './components/pages/CustomPageView';
import { FloatingCountdownTimer } from './components/timer/FloatingCountdownTimer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

const BinderApp: React.FC = () => {
  const { activePage } = useBinder();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'today':
        return <TodayDashboard />;
      case 'planner':
        return <PlannerPage />;
      case 'kanban':
        return <KanbanPage />;
      case 'habits':
        return <HabitsPage />;
      case 'finance':
        return <FinancePage />;
      case 'cleaning':
        return <CleaningPage />;
      case 'wellness':
        return <WellnessPage />;
      case 'meals':
        return <MealPlanningPage />;
      case 'projects':
        return <HomeProjectsPage />;
      case 'watchlist':
        return <WatchlistPage />;
      case 'albums':
        return <PhotoAlbumsPage />;
      case 'music':
        return <OfflineMusicPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'notes':
        return <NotesPage />;
      case 'documents':
        return <DocumentHubPage />;
      case 'setup':
        return <SetupPage />;
      default:
        return <CustomPageView pageId={activePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#efd0e5] dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] flex transition-colors duration-200">
      {/* Sleek Illuminated Vertical Command Rail */}
      <BinderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Mission-Control Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#efd0e5] dark:bg-[#120a10] overflow-x-hidden transition-colors duration-200">
        <BinderHeader
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenGemini={() => setIsGeminiOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 pb-24 lg:pb-7 max-w-[1620px] w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Gemini AI Assistant Slide-Over Drawer */}
      <GeminiAssistantDrawer
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
      />

      {/* Floating Focus Timer */}
      <FloatingCountdownTimer />

      {/* Mobile & Tablet Fixed Bottom Navigation Bar (< 1024px) */}
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

export default function App() {
  return (
    <BinderProvider>
      <BinderApp />
    </BinderProvider>
  );
}
