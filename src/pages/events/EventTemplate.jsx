// src/components/EventTemplate.jsx
import React from 'react';
import OptimizedImage from '../../components/OptimizedImage';
import Card from '../../components/UI/Card';
import styles from './EventTemplate.module.css';

const EventTemplate = ({
  title,
  subtitle,
  logo,
  description,
  eventDate,
  posterImage,
  importantNotice,
  contactEmail,
  contactPhone,
  contactPerson,
  links = [],
  mapSrc,
  sponsors = [],
  children
}) => {
  return (
    <div className={styles.eventWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            {logo && (
              <div className={styles.logoWrapper}>
                <OptimizedImage 
                  src={logo}
                  alt="Logo"
                  className={styles.heroLogo}
                />
              </div>
            )}
            <div className={styles.textWrapper}>
              <h1 className={styles.title}>{title}</h1>
              {/* {subtitle && <h2 className={styles.subtitle}>{subtitle}</h2>} */}
              {eventDate && <p className={styles.date}>{eventDate}</p>}
              {contactEmail && (
                <p className={styles.heroContact}>
                  <a href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Optional top-wide important notice banner */}
      {importantNotice && (
        <section className={styles.importantBanner}>
          <div className="container">
            <div className={styles.importantBannerInner}>
              <span className={styles.importantLabel}>Información importante</span>
              <span className={styles.importantText}>{importantNotice}</span>
              <span className={styles.importantLabel}>Important notice</span>
              <span className={styles.importantText}>NOMINAL entry until May 27th!</span>
            </div>
          </div>
        </section>
      )}

      <main className={styles.main}>
        <div className="container">
          {/* Two Column Layout */}
          <div className={styles.grid}>
            {/* Left Column - Poster */}
            <div className={styles.posterColumn}>
              {posterImage && (
                <OptimizedImage 
                  src={posterImage}
                  alt={`Cartel ${title}`}
                  className={styles.poster}
                />
              )}
            </div>

            {/* Right Column - Content */}
            <div className={styles.contentColumn}>
              {/* Main Description */}
              {description && (
                <Card hoverEffect={true} className={styles.descriptionCard}>
                  <h3>{subtitle || title}</h3>
                  <p className={styles.descriptionText}>{description}</p>
                </Card>
              )}

              {/* Custom content injected by each event (e.g. categories & ages) */}
              {children && (
                <div className={styles.customContent}>
                  {children}
                </div>
              )}

              {/* Contact card removed; contact email now appears in hero */}
            </div>
          </div>

          {/* Links Section (for acro page) */}
            {links.length > 0 && (
              <section className={styles.linksSection}>
                <h3>Documentación y Normativas</h3>
                <div className={styles.linksGrid}>
                  {links.map((link, index) => (
                    <div key={index}>
                      {link.documents ? (
                        // Bilingual document card
                        <div className={styles.bilingualCard}>
                          <div className={styles.bilingualHeader}>
                            {link.icon && (
                              <img src={link.icon} alt="" className={styles.linkIcon} />
                            )}
                            <span className={styles.bilingualTitle}>{link.title}</span>
                          </div>
                          <div className={styles.bilingualOptions}>
                            <a
                              href={link.documents.es}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.bilingualLink}
                            >
                              <span className={styles.langTag}>ESP</span>
                              <span className={styles.downloadIcon}>📄</span>
                            </a>
                            <a
                              href={link.documents.en}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.bilingualLink}
                            >
                              <span className={styles.langTag}>ENG</span>
                              <span className={styles.downloadIcon}>📄</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        // Regular single link card (for forms, etc.)
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkCard}
                        >
                          {link.icon && <img src={link.icon} alt="" className={styles.linkIcon} />}
                          <span>{link.text}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Map Section (for rit page) */}
          {mapSrc && (
            <section className={styles.mapSection}>
              <h3>Ubicación</h3>
              <div className={styles.mapContainer}>
                <iframe
                  src={mapSrc}
                  title="Mapa del evento"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>
          )}

          {/* Sponsors Section */}
          {sponsors.length > 0 && (
            <section className={styles.sponsorsSection}>
              <h3>Colaboran</h3>
              <div className={styles.sponsorsGrid}>
                {sponsors.map((sponsor, index) => (
                  <div key={index} className={styles.sponsorLogo}>
                    <OptimizedImage 
                      src={sponsor.logo}
                      alt={sponsor.name}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventTemplate;