import React from 'react';
import './OptimizeCV.css';
import { BaseComponent } from '../common/BaseComponent';
import { Button } from '../common/CommonComponents';
import { DocumentHandler } from '../../utils/documentHandler';
import { 
  DocumentArrowDownIcon, 
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

class OptimizeCV extends BaseComponent {
  state = {
    isSaving: false,
    improvements: [],
    acceptedChanges: {},
    currentDocument: '',
    showExplanation: {},
    processingError: null,
    acceptedChangesFeedback: {}
  };

  componentDidUpdate(prevProps) {
    if (prevProps.optimizedCV !== this.props.optimizedCV && this.props.optimizedCV) {
      this.processImprovements();
    }
  }

  processImprovements = () => {
    try {
      console.log('Raw API Response:', this.props.optimizedCV);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(this.props.optimizedCV);
      } catch (e) {
        const jsonMatch = this.props.optimizedCV.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse response as JSON');
        }
      }

      if (!parsedResponse || !Array.isArray(parsedResponse.improvements)) {
        throw new Error('Invalid response format');
      }

      this.setState({ 
        improvements: parsedResponse.improvements,
        currentDocument: this.props.originalCV,
        processingError: null
      });
    } catch (error) {
      console.error('Error processing improvements:', error);
      this.setState({
        processingError: 'Failed to process improvements. Please try again.'
      });
    }
  };

  handleAcceptChange = (index) => {
    this.setState(prevState => {
      const improvement = prevState.improvements[index];
      if (!improvement) return prevState;

      const originalText = improvement.original;
      const improvedText = improvement.improved;
      
      const updatedDocument = prevState.currentDocument.replace(
        originalText,
        improvedText
      );

      const feedback = {
        timestamp: new Date().toISOString(),
        originalText,
        improvedText,
        matchedRequirements: improvement.matchedRequirements || []
      };

      return {
        acceptedChanges: {
          ...prevState.acceptedChanges,
          [index]: true
        },
        currentDocument: updatedDocument,
        acceptedChangesFeedback: {
          ...prevState.acceptedChangesFeedback,
          [index]: feedback
        }
      };
    });
  };

  handleRejectChange = (index) => {
    this.setState(prevState => ({
      acceptedChanges: {
        ...prevState.acceptedChanges,
        [index]: false
      }
    }));
  };

  toggleExplanation = (index) => {
    this.setState(prevState => ({
      showExplanation: {
        ...prevState.showExplanation,
        [index]: !prevState.showExplanation[index]
      }
    }));
  };

  handleSave = async () => {
    const { currentDocument } = this.state;
    if (!currentDocument) return;
    
    this.setState({ isSaving: true });
    try {
      await DocumentHandler.generateOptimizedDoc(this.props.originalCV, currentDocument);
    } catch (error) {
      console.error('Error saving document:', error);
      this.props.onError?.(error.message);
    } finally {
      this.setState({ isSaving: false });
    }
  };

  renderImprovement = (improvement, index) => {
    const { acceptedChanges, showExplanation, acceptedChangesFeedback } = this.state;
    const isAccepted = acceptedChanges[index];
    const isDecided = isAccepted !== undefined;
    const isShowingExplanation = showExplanation[index];
    const feedback = acceptedChangesFeedback[index];

    return (
      <div key={index} className={`improvement-item ${isDecided ? (isAccepted ? 'accepted' : 'rejected') : ''}`}>
        <div className="improvement-header">
          <div className="improvement-location">
            <LightBulbIcon className="w-5 h-5" />
            <span>{improvement.location}</span>
            {improvement.impact && (
              <span className={`impact-badge ${improvement.impact.toLowerCase()}`}>
                {improvement.impact} Impact
              </span>
            )}
          </div>
          {!isDecided && (
            <div className="quick-actions">
              <Button
                onClick={() => this.handleAcceptChange(index)}
                className="quick-accept"
                title="Accept Change"
              >
                <CheckIcon className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => this.handleRejectChange(index)}
                className="quick-reject"
                title="Reject Change"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="improvement-content">
          <div className="original-text">
            <h4>Original</h4>
            <div className="text-content">{improvement.original}</div>
          </div>
          
          <div className="improved-text">
            <h4>Improved Version</h4>
            <div className="text-content">
              {improvement.improved}
              {improvement.matchedRequirements && (
                <div className="matched-requirements">
                  <h5>Matches Job Requirements:</h5>
                  <ul>
                    {improvement.matchedRequirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="improvement-footer">
          <Button
            onClick={() => this.toggleExplanation(index)}
            className="explanation-toggle"
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span>{isShowingExplanation ? 'Hide Explanation' : 'Show Explanation'}</span>
          </Button>

          {isShowingExplanation && (
            <div className="explanation-content">
              {improvement.explanation}
            </div>
          )}

          {isAccepted && feedback && (
            <div className="change-feedback">
              <div className="feedback-header">Change Applied</div>
              <div className="feedback-content">
                This improvement better matches these job requirements:
                <ul>
                  {feedback.matchedRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isDecided && (
            <div className="decision-indicator">
              {isAccepted ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Change Accepted</span>
                </>
              ) : (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  <span>Change Rejected</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { onOptimize, isLoading, error, originalFile } = this.props;
    const { isSaving, improvements, processingError } = this.state;
    const hasAcceptedChanges = Object.values(this.state.acceptedChanges).some(v => v);

    return (
      <div className="optimize-section">
        <div className="optimize-header">
          <Button 
            onClick={onOptimize} 
            disabled={isLoading}
            className="optimize-button"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>{isLoading ? 'Analyzing CV...' : 'Find Improvements'}</span>
          </Button>

          {improvements.length > 0 && (
            <div className="optimization-stats">
              <div className="stat-item">
                <span className="stat-label">Suggested Improvements</span>
                <span className="stat-value">{improvements.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Applied</span>
                <span className="stat-value">
                  {Object.values(this.state.acceptedChanges).filter(v => v).length}
                </span>
              </div>
            </div>
          )}
        </div>

        {processingError && (
          <div className="error-message">
            {processingError}
          </div>
        )}

        {improvements.length > 0 && (
          <>
            <div className="improvements-container">
              {improvements.map((improvement, index) => 
                this.renderImprovement(improvement, index)
              )}
            </div>
            
            {hasAcceptedChanges && (
              <div className="save-buttons">
                <Button 
                  onClick={this.handleSave} 
                  className="save-button"
                  disabled={isSaving || !originalFile}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>
                    {isSaving ? 'Generating Document...' : 
                     !originalFile ? 'Original file required' : 
                     'Save Changes'}
                  </span>
                </Button>
              </div>
            )}
          </>
        )}

        {this.renderError(error)}
      </div>
    );
  }
}

export default OptimizeCV;
