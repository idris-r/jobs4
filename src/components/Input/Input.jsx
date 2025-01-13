import React from 'react';
import './Input.css';
import { BaseComponent } from '../common/BaseComponent';
import { SectionHeader, Button, TextArea } from '../common/CommonComponents';
import { DocumentHandler } from '../../utils/documentHandler';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

class Input extends BaseComponent {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      fileName: '',
      isProcessing: false
    };
  }

  handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    this.setState({ isProcessing: true });
    try {
      const result = await DocumentHandler.extractText(file);
      this.setState({ fileName: file.name });
      this.props.onCvChange(result.text, result.originalFile);
    } catch (error) {
      this.props.onError?.(error.message);
    } finally {
      this.setState({ isProcessing: false });
    }
  };

  render() {
    const { 
      cvText, 
      jobDescription, 
      onCvChange, 
      onJobChange, 
      onAnalyze, 
      isLoading,
      error 
    } = this.props;

    const { isProcessing, fileName } = this.state;

    return (
      <div className="input-section">
        <div className="input-group">
          <SectionHeader>Your CV</SectionHeader>
          <div className="file-upload-container">
            <input
              type="file"
              ref={this.fileInputRef}
              accept=".docx,.txt"
              onChange={this.handleFileUpload}
              className="file-input"
            />
            <Button 
              onClick={() => this.fileInputRef.current?.click()}
              className="upload-button"
              disabled={isProcessing}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>
                {isProcessing ? 'Processing...' : 'Upload CV (.docx, .txt)'}
              </span>
            </Button>
            {fileName && (
              <div className="file-name">
                Uploaded: {fileName}
              </div>
            )}
          </div>
          <TextArea
            value={cvText}
            onChange={onCvChange}
            placeholder="Paste your CV here or upload a file..."
          />
        </div>
        
        <div className="input-group">
          <SectionHeader>Job Description</SectionHeader>
          <TextArea
            value={jobDescription}
            onChange={onJobChange}
            placeholder="Paste the job description here..."
          />
        </div>

        <Button 
          onClick={onAnalyze} 
          disabled={isLoading || isProcessing}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>

        {this.renderError(error)}
      </div>
    );
  }
}

export default Input;
