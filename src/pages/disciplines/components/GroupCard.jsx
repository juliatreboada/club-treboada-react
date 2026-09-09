// src/pages/disciplines/components/GroupCard.jsx
import { useState } from 'react';
import Card from '../../../components/UI/Card';
import styles from './GroupCard.module.css';

const PHONE_PATTERN = /\d[\d\s]{7,}\d/g;

// One cover photo per group can have `€` prices or the Contacto row itself
// highlighted; everything else renders plain.
const formatDetailValue = (label, value) => {
  if (!value) return '';
  if (label === 'Contacto' || value.includes('€')) {
    return <span className={styles.highlight}>{value}</span>;
  }
  return value;
};

// A Contacto value may list several people/numbers (free text, admin-edited).
// Only offer a tap-to-call button when we can unambiguously resolve one number.
const getSingleTelHref = (contactValue) => {
  if (!contactValue) return null;
  const matches = contactValue.match(PHONE_PATTERN);
  if (!matches || matches.length !== 1) return null;
  return `tel:${matches[0].replace(/\D/g, '')}`;
};

const GroupCard = ({ group }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const photo = group.images?.[0] || null;
  const contactDetail = group.details?.find((d) => d.label === 'Contacto');
  const telHref = getSingleTelHref(contactDetail?.value);

  return (
    <div className={styles.groupWrapper}>
      <div className={`${styles.sliderContainer} ${!imageLoaded ? styles.loading : ''}`}>
        {photo && !imageError ? (
          <img
            src={photo}
            alt={group.name}
            className={styles.singleImage}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>📸</span>
            <p>{group.name}</p>
          </div>
        )}
      </div>

      <Card hoverEffect={true} className={styles.infoCard}>
        <h3 className={styles.groupTitle}>{group.name}</h3>

        <div className={styles.detailsList}>
          {group.details && group.details.length > 0 ? (
            group.details.map((detail, index) => (
              <div key={index} className={styles.detailItem}>
                <span className={styles.detailLabel}>{detail.label}:</span>
                <span className={styles.detailValue}>
                  {formatDetailValue(detail.label, detail.value)}
                </span>
              </div>
            ))
          ) : (
            <p className={styles.noDetails}>Non hay información dispoñible</p>
          )}
        </div>

        <div className={styles.quickActions}>
          {telHref && (
            <a href={telHref} className={styles.actionButton} title="Llamar">
              📞
            </a>
          )}
          <button
            className={styles.actionButton}
            onClick={() => {
              const text = `Información sobre ${group.name} - Club Treboada`;
              if (navigator.share) {
                navigator.share({
                  title: group.name,
                  text,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(text);
                alert('Información copiada al portapapeles');
              }
            }}
            title="Compartir"
          >
            📋
          </button>
        </div>
      </Card>
    </div>
  );
};

export default GroupCard;
