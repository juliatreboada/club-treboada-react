// src/pages/disciplines/components/GroupNav.jsx
import { useState, useEffect, useRef } from 'react';
import styles from './GroupNav.module.css';

const GroupNav = ({ groups }) => {
  const [activeGroup, setActiveGroup] = useState('');
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset para header + nav
      
      // Encontrar el grupo actual basado en la posición de scroll
      let currentGroup = '';
      
      for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        const element = document.getElementById(`group-${group.id}`);
        
        if (element) {
          const { offsetTop, offsetHeight } = element;
          const elementBottom = offsetTop + offsetHeight;
          
          // Si estamos dentro del elemento o por encima de su inicio
          if (scrollPosition >= offsetTop - 100) {
            currentGroup = group.id;
            break;
          }
        }
      }
      
      // Si estamos al final de la página, seleccionar el último grupo
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (window.scrollY + clientHeight >= scrollHeight - 100) {
        // Estamos cerca del final, seleccionar el último grupo
        const lastGroup = groups[groups.length - 1];
        if (lastGroup) {
          setActiveGroup(lastGroup.id);
          return;
        }
      }
      
      setActiveGroup(currentGroup);
    };

    window.addEventListener('scroll', handleScroll);
    // Ejecutar una vez al montar para establecer el inicial
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groups]);

  const scrollToGroup = (groupId) => {
    const element = document.getElementById(`group-${groupId}`);
    if (element && navRef.current) {
      const headerOffset = 120; // Header height + nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Forzar actualización del active después del scroll
      setTimeout(() => {
        setActiveGroup(groupId);
      }, 300);
    }
  };

  if (!groups || groups.length === 0) return null;

  return (
    <div className={styles.groupNav} ref={navRef}>
      <div className="container">
        <div className={styles.navList}>
          {groups.map((group) => (
            <button
              key={group.id}
              className={`${styles.navButton} ${activeGroup === group.id ? styles.active : ''}`}
              onClick={() => scrollToGroup(group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupNav;