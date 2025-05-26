import React, { useState } from 'react';
import styled from 'styled-components';
import StarRating from './StarRating';
import { FeedbackData } from '../types';

interface FeedbackFormProps {
  onSubmit: (data: Omit<FeedbackData, 'metadata'>) => void;
  onClose: () => void;
  companyName: string;
  companyLogo: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  onSubmit, 
  onClose, 
  companyName,
  companyLogo 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    onSubmit({
      rating,
      comment,
      email: email.trim() || undefined,
    });
  };
  
  return (
    <FormContainer>
      <Header>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>
          {companyLogo && <CompanyLogo src={companyLogo} alt={companyName} />}
          How was your experience with {companyName}?
        </Title>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <StarRating 
            value={rating} 
            onChange={setRating} 
            size={32} 
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="comment">Share your feedback</Label>
          <TextArea 
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? (optional)"
            rows={3}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Your email (optional)</Label>
          <Input 
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </SubmitButton>
      </Form>
      
      <Footer>
        <PoweredBy>Powered by Feedback Widget</PoweredBy>
      </Footer>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  background-color: ${props => props.theme.backgroundColor};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 320px;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  padding: 16px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  display: flex;
  align-items: center;
`;

const CompanyLogo = styled.img`
  height: 24px;
  margin-right: 8px;
`;

const Form = styled.form`
  padding: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.textColor};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.primaryColor};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      const color = props.theme.primaryColor;
      // Darken the color by 10%
      return color.startsWith('#') 
        ? `#${color.substring(1).split('').map(c => {
            const hex = parseInt(c, 16);
            return Math.max(0, hex - 1).toString(16);
          }).join('')}`
        : color;
    }};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  padding: 8px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PoweredBy = styled.div`
  font-size: 12px;
  color: #999;
`;

export default FeedbackForm;
