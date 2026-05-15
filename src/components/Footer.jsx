// src/components/Footer.jsx
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer id="footer" className={styles.footer}>
      <div className="container">
        <h3>Club Treboada</h3>
        <p>Gimnasia Rítmica, Acrobática y Trampolín</p>
        
        <div className={styles.socialLinks}>
          <a 
            href="https://es-la.facebook.com/ClubTreboada/photos_albums" 
            className={styles.facebook}
            target="_blank" 
            rel="noreferrer noopener"
            aria-label="Facebook"
          >
            <i className="bx bxl-facebook"></i>
          </a>
          
          <a 
            href="https://www.instagram.com/clubtreboada_ritmica/" 
            className={styles.instagram}
            target="_blank" 
            rel="noreferrer noopener"
            aria-label="Instagram Rítmica"
            title="Instagram Rítmica"
          >
            <i className="bx bxl-instagram"></i>
          </a>
          
          <a 
            href="https://www.instagram.com/clubtreboada_acrobatica/" 
            className={styles.instagram}
            target="_blank" 
            rel="noreferrer noopener"
            aria-label="Instagram Acrobática"
            title="Instagram Acrobática"
          >
            <i className="bx bxl-instagram"></i>
          </a>
          
          <a 
            href="https://www.instagram.com/clubtreboada_trampolin/" 
            className={styles.instagram}
            target="_blank" 
            rel="noreferrer noopener"
            aria-label="Instagram Trampolín"
            title="Instagram Trampolín"
          >
            <i className="bx bxl-instagram"></i>
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;