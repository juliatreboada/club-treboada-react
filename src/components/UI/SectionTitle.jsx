// src/components/UI/SectionTitle.jsx
import styles from './SectionTitle.module.css';

const SectionTitle = ({ 
  title, 
  subtitle, 
  children, // Allow custom content instead of title string
  align = 'center',
  className = '' 
}) => {
  return (
    <div className={`${styles.sectionTitle} ${styles[align]} ${className}`}>
      {children ? (
        children
      ) : (
        <>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </>
      )}
    </div>
  );
};

export default SectionTitle;