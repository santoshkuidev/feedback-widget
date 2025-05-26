import React from 'react';
import styled from 'styled-components';

interface FeedbackButtonProps {
  onClick: () => void;
  companyName: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick, companyName }) => {
  return (
    <ButtonContainer onClick={onClick}>
      <ButtonText>Feedback</ButtonText>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonText = styled.span`
  margin-left: 4px;
`;

export default FeedbackButton;
