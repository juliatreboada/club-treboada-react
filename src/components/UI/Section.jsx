// src/components/UI/Section.jsx
import styles from './Section.module.css';

const Section = ({ id, children, background = 'light', className = '' }) => {
  return (
    <section 
      id={id} 
      className={`${styles.section} ${styles[background]} ${className}`}
    >
      <div className="container">
        {children}
      </div>
    </section>
  );
};

export default Section;