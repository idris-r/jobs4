import React from 'react';
import './ActionableItems.css';
import { SectionHeader } from '../common/CommonComponents';

const ActionableItems = ({ actionableItems }) => {
  return (
    <div className="actionable-items-section">
      <SectionHeader>Actionable Items</SectionHeader>
      <div className="actionable-content">
        {actionableItems || 'No actionable items yet. Run analysis first.'}
      </div>
    </div>
  );
};

export default ActionableItems;
