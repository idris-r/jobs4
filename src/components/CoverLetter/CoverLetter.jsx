import React from 'react';
import './CoverLetter.css';
import { BaseComponent } from '../common/BaseComponent';
import { Button, TextArea } from '../common/CommonComponents';

class CoverLetter extends BaseComponent {
  render() {
    const { 
      wordLimit, 
      onWordLimitChange, 
      onGenerate, 
      coverLetter,
      isLoading,
      error 
    } = this.props;

    return (
      <div className="cover-letter-section">
        <div className="controls">
          <label>
            <span>Word Limit:</span>
            <input
              type="number"
              value={wordLimit}
              onChange={onWordLimitChange}
              min="100"
              max="1000"
            />
          </label>
          <Button 
            onClick={onGenerate} 
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Cover Letter'}
          </Button>
        </div>
        
        {coverLetter && <TextArea value={coverLetter} readOnly rows={12} />}
        {this.renderError(error)}
      </div>
    );
  }
}

export default CoverLetter;
