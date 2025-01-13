import React, { useState, useCallback } from 'react';
import './App.css';
import { SECTIONS, PROMPTS } from './utils/constants';
import { useApi } from './hooks/useApi';
import { Button, MenuItem } from './components/common/CommonComponents';
import Input from './components/Input/Input';
import Analysis from './components/Analysis/Analysis';
import ActionableItems from './components/ActionableItems/ActionableItems';
import OptimizeCV from './components/OptimizeCV/OptimizeCV';
import CoverLetter from './components/CoverLetter/CoverLetter';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  DocumentDuplicateIcon, 
  EnvelopeIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const MENU_ITEMS = [
  { id: SECTIONS.INPUT, icon: DocumentTextIcon, label: 'Input' },
  { id: SECTIONS.ANALYSIS, icon: ChartBarIcon, label: 'Analysis' },
  { id: SECTIONS.ACTIONABLE, icon: ClipboardDocumentListIcon, label: 'Actions' },
  { id: SECTIONS.OPTIMIZE, icon: DocumentDuplicateIcon, label: 'Optimize' },
  { id: SECTIONS.COVER, icon: EnvelopeIcon, label: 'Cover Letter' }
];

function App() {
  // State Management
  const [state, setState] = useState({
    cvText: '',
    jobDescription: '',
    wordLimit: 200,
    activeSection: SECTIONS.INPUT,
    isDarkMode: true,
    originalFile: null
  });

  // API Hooks
  const analysisApi = useApi();
  const actionsApi = useApi();
  const coverLetterApi = useApi();
  const optimizeApi = useApi();

  // Computed Properties
  const isInputEmpty = !state.cvText.trim() || !state.jobDescription.trim();

  // Event Handlers
  const handleCvChange = useCallback((value, originalFile = null) => {
    setState(prev => ({
      ...prev,
      cvText: typeof value === 'string' ? value : value.target.value,
      originalFile: originalFile
    }));
  }, []);

  const handleInputChange = useCallback((field) => (e) => {
    setState(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSectionChange = useCallback((section) => {
    setState(prev => ({ ...prev, activeSection: section }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    document.body.classList.toggle('light-mode');
  }, []);

  // API Handlers
  const handleAnalyze = async () => {
    if (isInputEmpty) return;

    const result = await analysisApi.execute(
      PROMPTS.ANALYZE(state.cvText, state.jobDescription),
      true
    );

    if (result) {
      await actionsApi.execute(
        PROMPTS.ACTIONS(state.cvText, state.jobDescription)
      );
      handleSectionChange(SECTIONS.ANALYSIS);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (isInputEmpty) return;
    
    await coverLetterApi.execute(
      PROMPTS.COVER_LETTER(state.cvText, state.jobDescription, state.wordLimit)
    );
  };

  const handleOptimizeCV = async () => {
    if (isInputEmpty) return;
    
    await optimizeApi.execute(
      PROMPTS.OPTIMIZE(state.cvText, state.jobDescription),
      false,
      2000
    );
  };

  // Render Helpers
  const renderSection = () => {
    const sections = {
      [SECTIONS.INPUT]: (
        <Input
          cvText={state.cvText}
          jobDescription={state.jobDescription}
          onCvChange={handleCvChange}
          onJobChange={handleInputChange('jobDescription')}
          onAnalyze={handleAnalyze}
          isLoading={analysisApi.loading}
          error={analysisApi.error}
        />
      ),
      [SECTIONS.ANALYSIS]: (
        <Analysis
          score={analysisApi.data?.score}
          justification={analysisApi.data?.justification}
          cvText={state.cvText}
          jobDescription={state.jobDescription}
          error={analysisApi.error}
        />
      ),
      [SECTIONS.ACTIONABLE]: (
        <ActionableItems 
          actionableItems={actionsApi.data}
          error={actionsApi.error}
        />
      ),
      [SECTIONS.OPTIMIZE]: (
        <OptimizeCV
          onOptimize={handleOptimizeCV}
          optimizedCV={optimizeApi.data}
          originalCV={state.cvText}
          originalFile={state.originalFile}
          isLoading={optimizeApi.loading}
          error={optimizeApi.error}
        />
      ),
      [SECTIONS.COVER]: (
        <CoverLetter
          wordLimit={state.wordLimit}
          onWordLimitChange={handleInputChange('wordLimit')}
          onGenerate={handleGenerateCoverLetter}
          coverLetter={coverLetterApi.data}
          isLoading={coverLetterApi.loading}
          error={coverLetterApi.error}
        />
      )
    };

    return sections[state.activeSection] || null;
  };

  const renderNavigation = () => (
    <nav className="side-menu">
      <div className="menu-header">
        <h1>CV Matcher</h1>
      </div>
      
      <ul>
        {MENU_ITEMS.map(({ id, icon: Icon, label }) => (
          <MenuItem
            key={id}
            isActive={state.activeSection === id}
            disabled={isInputEmpty && id !== SECTIONS.INPUT}
            onClick={() => !isInputEmpty && handleSectionChange(id)}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </MenuItem>
        ))}
      </ul>
      
      <div className="theme-toggle">
        <Button onClick={toggleTheme} className="theme-button">
          {state.isDarkMode ? (
            <>
              <SunIcon className="w-5 h-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
    </nav>
  );

  return (
    <div className={`app-container ${state.isDarkMode ? 'dark' : 'light'}`}>
      {renderNavigation()}
      
      <main className="content-area">
        {renderSection()}
        
        {/* Global Error Display */}
        {(analysisApi.error || actionsApi.error || optimizeApi.error || coverLetterApi.error) && (
          <div className="error">
            {analysisApi.error || actionsApi.error || optimizeApi.error || coverLetterApi.error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
