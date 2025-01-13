import React from 'react';
import './Analysis.css';
import { SectionHeader } from '../common/CommonComponents';
import { ScoreDisplay } from '../common/ScoreDisplay';

const AnalysisComparison = ({ cvText, jobDescription }) => {
  const calculateScore = (cvTerm, jdTerm) => {
    if (!cvText || !jobDescription) return null;
    const cvCount = (cvText.match(new RegExp(cvTerm, 'gi')) || []).length;
    const jdCount = (jobDescription.match(new RegExp(cvTerm, 'gi')) || []).length;
    return jdCount === 0 ? null : Math.min(100, Math.round((cvCount / jdCount) * 100));
  };

  return (
    <div className="comparison-section">
      <h3>Key Comparisons</h3>
      <div className="score-grid">
        <ScoreDisplay score={calculateScore('education', 'education')} label="Education" />
        <ScoreDisplay score={calculateScore('experience', 'experience')} label="Experience" />
        <ScoreDisplay score={calculateScore('skill', 'skill')} label="Skills" />
      </div>
    </div>
  );
};

const Analysis = ({ score, justification, cvText, jobDescription }) => {
  return (
    <div className="analysis-section">
      <div className="main-score-container">
        <ScoreDisplay score={score} label="Overall Match" />
      </div>
      <div className="analysis-content">
        <SectionHeader>Analysis</SectionHeader>
        <div className="justification">
          {justification || 'Run analysis to see results'}
        </div>
        <AnalysisComparison cvText={cvText} jobDescription={jobDescription} />
      </div>
    </div>
  );
};

export default Analysis;
