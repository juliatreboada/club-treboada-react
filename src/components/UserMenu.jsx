// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarEmoji, getAvatarColor } from '../config/avatars';
import styles from './UserMenu.module.css';

const STAFF_ROLES = ['admin', 'coach'];

const UserMenu = () => {
  const { user, role, displayName, avatar, avatarColor, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const isStaff = STAFF_ROLES.includes(role);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link to="/login" className={styles.signInButton}>
        Acceder
      </Link>
    );
  }

  const userEmail = user.email || 'User';
  const avatarEmoji = getAvatarEmoji(avatar);
  const avatarBg = getAvatarColor(avatarColor);
  const initial = (
    (displayName || userEmail).trim().charAt(0) || '?'
  ).toUpperCase();

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.warn('[user-menu] signOut threw', err);
    }
    navigate('/');
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className={styles.avatar} style={{ background: avatarBg }}>
          {avatarEmoji ? (
            <span className={styles.avatarEmoji}>{avatarEmoji}</span>
          ) : (
            initial
          )}
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            {displayName && (
              <p className={styles.userName}>{displayName}</p>
            )}
            <p className={styles.userEmail}>{userEmail}</p>
          </div>

          <div className={styles.divider} />

          <button
            className={styles.menuItem}
            onClick={() => {
              setIsOpen(false);
              navigate('/dashboard');
            }}
          >
            <span>👤</span> O meu perfil
          </button>

          {isStaff && (
            <button
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/inscricions');
              }}
            >
              <span>📋</span> Inscricións campamento
            </button>
          )}

          {isStaff && (
            <button
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/calendario');
              }}
            >
              <span>📅</span> Calendario (xestión)
            </button>
          )}

          {isStaff && (
            <button
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/hero');
              }}
            >
              <span>🖼️</span> Carrusel da portada
            </button>
          )}

          <div className={styles.divider} />

          <button
            className={`${styles.menuItem} ${styles.signOut}`}
            onClick={handleSignOut}
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
