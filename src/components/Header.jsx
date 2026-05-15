// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { scrollToSection } from '../utils/scrollUtils';
import UserMenu from './UserMenu';
import styles from './Header.module.css';
import { HOME_SECTIONS, NAV_ITEMS } from '../config/navigationConfig';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  // Check if current page is not home (has a path longer than '/')
  const isInnerPage = location.pathname !== '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detectar seccion activa solo si estamos en la home
      if (location.pathname === '/') {
        const scrollPosition = window.scrollY + 150; // Offset para el header

        for (const section of HOME_SECTIONS) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            const sectionStart = offsetTop;
            const sectionEnd = offsetTop + offsetHeight;

            if (scrollPosition >= sectionStart && scrollPosition < sectionEnd) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
    }
  }, [location.pathname]);

  // Handle section scrolling when coming from another page
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(sectionId);
        setActiveSection(sectionId);
      }, 100);
    }
  }, [location]);

  const handleNavClick = (e, path) => {
    setIsMenuOpen(false);

    if (path.includes('#')) {
      const [route, section] = path.split('#');

      if (route !== '' && location.pathname !== route) {
        // En otra pagina dejamos que el Link haga su trabajo
        return;
      }

      e.preventDefault();
      scrollToSection(section);
      setActiveSection(section);
    }
  };

  const isActiveLink = (itemPath) => {
    // Paginas internas (Catalogo, Calendario)
    if (!itemPath.includes('#')) {
      return location.pathname === itemPath;
    }

    const [, hash] = itemPath.split('#');

    if (location.pathname === '/') {
      if (!activeSection && hash === 'hero') {
        return true;
      }
      return activeSection === hash;
    }

    return false;
  };

  const headerClass = `${styles.header} ${isScrolled ? styles.scrolled : ''} ${
    isInnerPage ? styles.innerPage : ''
  }`;

  return (
    <header className={headerClass}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            Club Treboada
          </Link>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className={styles.menuIcon}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`${styles.navLink} ${
                isActiveLink(item.path) ? styles.active : ''
              }`}
              onClick={(e) => handleNavClick(e, item.path)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={styles.userMenuWrapper}>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
