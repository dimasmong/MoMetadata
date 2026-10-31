import React from 'react';
import { LanguageProvider } from './i18n/useLanguage';
import { ThemeProvider } from './themes/useTheme';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Workspace } from './components/Workspace';
import { FeaturesSection } from './components/Sections/FeaturesSection';
import { HowItWorksSection } from './components/Sections/HowItWorksSection';
import { CapabilityMatrixSection } from './components/Sections/CapabilityMatrixSection';
import { FaqSection } from './components/Sections/FaqSection';
import { AttributionSection } from './components/Sections/AttributionSection';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const handleScrollToWorkspace = () => {
    const el = document.getElementById('workspace-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1020] text-slate-900 dark:text-[#F5F7FC] transition-colors">
      <Header onNavigateSection={handleNavigateSection} />
      <main className="flex-1">
        <Hero onScrollToWorkspace={handleScrollToWorkspace} />
        <Workspace />
        <FeaturesSection />
        <HowItWorksSection />
        <CapabilityMatrixSection />
        <FaqSection />
        <AttributionSection />
      </main>
      <Footer onNavigateSection={handleNavigateSection} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
