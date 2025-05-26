import React from 'react';
import styled from 'styled-components';

interface FeedbackSuccessProps {
  companyName: string;
}

const FeedbackSuccess: React.FC<FeedbackSuccessProps> = ({ companyName }) => {
  return (
    <SuccessContainer>
      <SuccessIcon>✓</SuccessIcon>
      <SuccessTitle>Thank you!</SuccessTitle>
      <SuccessMessage>
        Your feedback has been submitted successfully. We appreciate you taking the time to share your thoughts with {companyName}.
      </SuccessMessage>
    </SuccessContainer>
  );
};

const SuccessContainer = styled.div`
  background-color: ${props => props.theme.backgroundColor};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 320px;
  padding: 24px;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
`;

const SuccessTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.textColor};
  opacity: 0.8;
`;

export default FeedbackSuccess;
