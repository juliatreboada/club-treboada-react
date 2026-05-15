// src/pages/disciplines/components/GroupCard.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useState } from 'react';
import OptimizedImage from '../../../components/OptimizedImage';
import Card from '../../../components/UI/Card';
import styles from './GroupCard.module.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const GroupCard = ({ group }) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Check if group has images
  const hasImages = group.images && group.images.length > 0;
  const hasMultipleImages = hasImages && group.images.length > 1;

  // Format detail value with highlights for prices and contacts
  const formatDetailValue = (value) => {
    if (!value) return '';
    if (value.includes('€') || value.includes('Contacto') || value.includes('Laura') || value.includes('Eva') || value.includes('Susana') || value.includes('Carmelo')) {
      return <span className={styles.highlight}>{value}</span>;
    }
    return value;
  };

const handleImageError = (index, src) => {
  console.error(`❌ Failed to load image: ${src}`);
  console.log('Current origin:', window.location.origin);
  console.log('Full URL would be:', window.location.origin + src);
  console.log('Group name:', group.name);
  console.log('All images in group:', group.images);
  setImageErrors(prev => ({ ...prev, [index]: true }));
};

  // If only one image, don't use Swiper
  if (hasImages && !hasMultipleImages) {
    return (
      <div className={styles.groupWrapper}>
        {/* Single Image */}
        <div className={`${styles.sliderContainer} ${!imagesLoaded ? styles.loading : ''}`}>
          {!imageErrors[0] ? (
            <img
              src={group.images[0]}
              alt={group.name}
              className={styles.singleImage}
              onLoad={() => setImagesLoaded(true)}
              onError={() => handleImageError(0)}
            />
          ) : (
            <div className={styles.placeholderImage}>
              <span>📸</span>
              <p>{group.name}</p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card hoverEffect={true} className={styles.infoCard}>
          <h3 className={styles.groupTitle}>{group.name}</h3>
          
          <div className={styles.detailsList}>
            {group.details && group.details.length > 0 ? (
              group.details.map((detail, index) => (
                <div key={index} className={styles.detailItem}>
                  {typeof detail === 'object' ? (
                    <>
                      <span className={styles.detailLabel}>{detail.label}:</span>
                      <span className={styles.detailValue}>
                        {formatDetailValue(detail.value)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.detailValue}>{formatDetailValue(detail)}</span>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.noDetails}>Non hay información dispoñible</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            {group.details?.some(d => typeof d === 'object' && d.label === 'Contacto') && (
              <a 
                href={`tel:${group.details.find(d => d.label === 'Contacto')?.value.replace(/\D/g, '')}`}
                className={styles.actionButton}
                title="Llamar"
              >
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
                    text: text,
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
  }

  // Multiple images - use Swiper
  return (
    <div className={styles.groupWrapper}>
      {/* Image Slider */}
      <div className={`${styles.sliderContainer} ${!imagesLoaded ? styles.loading : ''}`}>
        {hasImages ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={hasMultipleImages ? {
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            } : false}
            loop={hasMultipleImages}
            className={styles.swiper}
            onInit={() => setImagesLoaded(true)}
          >
            {group.images.map((image, index) => (
              <SwiperSlide key={index}>
                {!imageErrors[index] ? (
                  <img 
                    src={image}
                    alt={`${group.name} - Imagen ${index + 1}`}
                    className={styles.sliderImage}
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <span>📸</span>
                    <p>{group.name}</p>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className={styles.placeholderImage}>
            <span>📸</span>
            <p>{group.name}</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card hoverEffect={true} className={styles.infoCard}>
        <h3 className={styles.groupTitle}>{group.name}</h3>
        
        <div className={styles.detailsList}>
          {group.details && group.details.length > 0 ? (
            group.details.map((detail, index) => (
              <div key={index} className={styles.detailItem}>
                {typeof detail === 'object' ? (
                  <>
                    <span className={styles.detailLabel}>{detail.label}:</span>
                    <span className={styles.detailValue}>
                      {formatDetailValue(detail.value)}
                    </span>
                  </>
                ) : (
                  <span className={styles.detailValue}>{formatDetailValue(detail)}</span>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noDetails}>Non hay información dispoñible</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          {group.details?.some(d => typeof d === 'object' && d.label === 'Contacto') && (
            <a 
              href={`tel:${group.details.find(d => d.label === 'Contacto')?.value.replace(/\D/g, '')}`}
              className={styles.actionButton}
              title="Llamar"
            >
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
                  text: text,
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