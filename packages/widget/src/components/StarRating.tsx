import React from 'react';
import styled from 'styled-components';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  size = 24 
}) => {
  return (
    <Container>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          filled={star <= value}
          onClick={() => onChange(star)}
          size={size}
        >
          ★
        </Star>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
`;

const Star = styled.span<{ filled: boolean; size: number }>`
  color: ${props => props.filled ? props.theme.starColor : '#ddd'};
  font-size: ${props => props.size}px;
  cursor: pointer;
  transition: transform 0.1s ease, color 0.1s ease;
  user-select: none;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:not(:last-child) {
    margin-right: 5px;
  }
`;

export default StarRating;
