// src/pages/more/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AVATAR_OPTIONS,
  AVATAR_COLORS,
  getAvatarEmoji,
  getAvatarColor,
} from '../../config/avatars';
import styles from './DashboardPage.module.css';

const roleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'coach':
      return 'Adestradora';
    default:
      return 'Usuaria';
  }
};

const STAFF_ROLES = ['admin', 'coach'];

const DashboardPage = () => {
  const {
    user,
    role,
    displayName,
    avatar,
    avatarColor,
    signOut,
    updateProfile,
  } = useAuth();
  const isStaff = STAFF_ROLES.includes(role);

  const [nameDraft, setNameDraft] = useState(displayName || '');
  const [avatarDraft, setAvatarDraft] = useState(avatar || '');
  const [colorDraft, setColorDraft] = useState(avatarColor || '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setNameDraft(displayName || '');
  }, [displayName]);

  useEffect(() => {
    setAvatarDraft(avatar || '');
  }, [avatar]);

  useEffect(() => {
    setColorDraft(avatarColor || '');
  }, [avatarColor]);

  const isDirty =
    (nameDraft || '') !== (displayName || '') ||
    (avatarDraft || '') !== (avatar || '') ||
    (colorDraft || '') !== (avatarColor || '');

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isDirty) return;
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile({
        displayName: nameDraft,
        avatar: avatarDraft,
        avatarColor: colorDraft,
      });
      setFeedback({ kind: 'success', message: 'Perfil actualizado.' });
    } catch (err) {
      setFeedback({
        kind: 'error',
        message:
          err?.message || 'Non se puido gardar o perfil. Téntao de novo.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNameDraft(displayName || '');
    setAvatarDraft(avatar || '');
    setColorDraft(avatarColor || '');
    setFeedback(null);
  };

  const previewEmoji = getAvatarEmoji(avatarDraft);
  const previewColor = getAvatarColor(colorDraft);
  const fallbackInitial = (
    (nameDraft || displayName || user?.email || '?')
      .trim()
      .charAt(0) || '?'
  ).toUpperCase();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div
          className={styles.avatarPreview}
          style={{ background: previewColor }}
          aria-hidden="true"
        >
          {previewEmoji || fallbackInitial}
        </div>
        <div>
          <h1 className={styles.title}>
            {displayName || user?.email || 'Usuaria'}
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.rolePill}>{roleLabel(role)}</span>
            <span className={styles.email}>{user?.email}</span>
          </p>
        </div>
      </header>

      <section className={styles.card}>
        <form onSubmit={handleSave}>
          <div className={styles.cardGrid}>
            <div className={styles.cardLeft}>
              <h2 className={styles.cardTitle}>O meu perfil</h2>
              <p className={styles.cardHint}>
                Personaliza o teu nome visible, elixe un avatar e a cor de
                fondo.
              </p>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Nome visible</span>
                <input
                  type="text"
                  className={styles.input}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={60}
                  placeholder="Ex.: Julia V."
                />
              </label>

              <fieldset className={styles.colorGroup}>
                <legend className={styles.fieldLabel}>Cor de fondo</legend>
                <div className={styles.colorRow}>
                  {AVATAR_COLORS.map((option) => {
                    const selected =
                      colorDraft === option.id ||
                      (!colorDraft && option.id === AVATAR_COLORS[0].id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${styles.colorSwatch} ${
                          selected ? styles.colorSwatchSelected : ''
                        }`}
                        style={{ background: option.value }}
                        onClick={() => setColorDraft(option.id)}
                        aria-label={option.label}
                        aria-pressed={selected}
                        title={option.label}
                      />
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <fieldset className={styles.avatarGroup}>
              <legend className={styles.fieldLabel}>Avatar</legend>
              <div className={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((option) => {
                  const selected = avatarDraft === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.avatarOption} ${
                        selected ? styles.avatarOptionSelected : ''
                      }`}
                      onClick={() => setAvatarDraft(option.id)}
                      aria-label={option.label}
                      aria-pressed={selected}
                    >
                      <span className={styles.avatarEmoji}>{option.emoji}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={`${styles.avatarOption} ${
                    !avatarDraft ? styles.avatarOptionSelected : ''
                  }`}
                  onClick={() => setAvatarDraft('')}
                  aria-label="Sen avatar"
                  aria-pressed={!avatarDraft}
                >
                  <span className={styles.avatarInitial}>{fallbackInitial}</span>
                </button>
              </div>
            </fieldset>
          </div>

          {feedback && (
            <p
              className={
                feedback.kind === 'success'
                  ? styles.feedbackSuccess
                  : styles.feedbackError
              }
            >
              {feedback.message}
            </p>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleReset}
              disabled={!isDirty || saving}
            >
              Desfacer
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!isDirty || saving}
            >
              {saving ? 'Gardando…' : 'Gardar cambios'}
            </button>
          </div>
        </form>
      </section>

      {isStaff && (
        <section className={styles.quickActions}>
          <h2 className={styles.quickActionsTitle}>Accesos rápidos</h2>
          <div className={styles.quickActionsGrid}>
            <Link to="/admin/inscricions" className={styles.quickActionCard}>
              <span className={styles.quickActionLabel}>Campamento</span>
              <span className={styles.quickActionTitle}>
                Inscricións campamento
              </span>
              <span className={styles.quickActionHint}>
                Ver e xestionar as inscricións recibidas
              </span>
            </Link>
            <Link to="/admin/calendario" className={styles.quickActionCard}>
              <span className={styles.quickActionLabel}>Calendario</span>
              <span className={styles.quickActionTitle}>
                Xestionar calendario
              </span>
              <span className={styles.quickActionHint}>
                Crear e editar eventos públicos do club
              </span>
            </Link>
            <Link to="/admin/hero" className={styles.quickActionCard}>
              <span className={styles.quickActionLabel}>Portada</span>
              <span className={styles.quickActionTitle}>
                Carrusel da portada
              </span>
              <span className={styles.quickActionHint}>
                Engadir, editar ou reordenar os slides do inicio
              </span>
            </Link>
          </div>
        </section>
      )}

      <div className={styles.actions}>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default DashboardPage;
