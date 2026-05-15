// src/components/UI/Button.jsx
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  href, 
  variant = 'primary',
  size = 'medium',
  className = '',
  onClick,
  external = false,
  icon, // ← Nuevo prop para el icono
  iconPosition = 'left', // 'left' o 'right'
  ...props 
}) => {
  const buttonClasses = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && (
        <span className={styles.iconLeft}>
          <img src={icon} alt="" className={styles.buttonIcon} />
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className={styles.iconRight}>
          <img src={icon} alt="" className={styles.buttonIcon} />
        </span>
      )}
    </>
  );

  // External link
  if (external && href) {
    return (
      <a 
        href={href}
        className={buttonClasses}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Internal link (React Router)
  if (href) {
    return (
      <Link to={href} className={buttonClasses} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  // Regular button
  return (
    <button className={buttonClasses} onClick={onClick} {...props}>
      {content}
    </button>
  );
};

export default Button;