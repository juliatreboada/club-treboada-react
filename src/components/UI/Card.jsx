// src/components/UI/Card.jsx
import styles from './Card.module.css';

const Card = ({ children, className, hoverEffect = true, onClick }) => {
  return (
    <div 
      className={`${styles.card} ${hoverEffect ? styles.hover : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;