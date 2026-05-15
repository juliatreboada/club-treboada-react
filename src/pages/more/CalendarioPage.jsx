// src/pages/more/CalendarioPage.jsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import OptimizedImage from '../../components/OptimizedImage';
import { categories, schools } from '../../config/calendarTaxonomy';
import { dbRowToFullCalendarEvent, listEvents } from '../../lib/calendarRepository';
import styles from './CalendarioPage.module.css';

const CalendarioPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await listEvents();
      if (cancelled) return;
      if (error) {
        console.error('[calendario]', error);
        setLoadError(error.message || 'Non se puido cargar o calendario.');
        setEvents([]);
      } else {
        setEvents((data || []).map(dbRowToFullCalendarEvent));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

  // Custom event rendering to apply colors
  const renderEventContent = (eventInfo) => {
    const props = eventInfo.event.extendedProps;
    let backgroundColor = '#000000b9'; // default
    
    if (props.school) {
      const school = schools.find(s => s.label === props.school);
      if (school) backgroundColor = school.color;
    } else if (props.category) {
      const category = categories.find(c => c.id === props.category);
      if (category) backgroundColor = category.color;
    }

    return (
      <div 
        style={{ 
          backgroundColor, 
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          cursor: 'pointer',
          borderColor: 'black',
        }}
      >
        {eventInfo.event.title}
      </div>
    );
  };

  return (
    <div className={styles.calendarPage}>
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Calendario de Eventos</h1>
          <p className={styles.subtitle}>Aquí encontrarás las fechas importantes del Club Treboada</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container">
        {loadError && (
          <p
            style={{
              background: '#fff0f0',
              color: '#8c1f1c',
              padding: '1rem',
              borderRadius: 8,
              marginBottom: '1rem',
            }}
            role="alert"
          >
            {loadError}
          </p>
        )}

        {/* Legend */}
        <section className={styles.legendSection}>
          <div className={styles.legendContainer}>
            <div className={styles.legendGroup}>
              <h4 className={styles.legendTitle}>Escolas:</h4>
              {schools.map(school => (
                <div key={school.id} className={styles.legendItem}>
                  <span 
                    className={styles.colorDot} 
                    style={{ backgroundColor: school.color }}
                  />
                  <span className={styles.legendLabel}>{school.label}</span>
                </div>
              ))}
            </div>
            
            <div className={styles.legendGroup}>
              <h4 className={styles.legendTitle}>Modalidades:</h4>
              {categories.map(category => (
                <div key={category.id} className={styles.legendItem}>
                  <span 
                    className={styles.colorDot} 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className={styles.legendLabel}>{category.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calendar */}
        <section className={styles.calendarContainer}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Cargando calendario…
            </p>
          ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            firstDay={1}
            height="auto"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next today'
            }}
            buttonText={{
              today: 'Hoy'
            }}
            nowIndicator={true}
            events={events}
            eventClick={(info) => {
              info.jsEvent.preventDefault();
              setSelectedEvent({
                id: info.event.id,
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                ...info.event.extendedProps
              });
            }}
            eventContent={renderEventContent}
            dayMaxEvents={true}
          />
          )}
        </section>
      </main>

      {/* Event Modal */}
      {selectedEvent && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedEvent(null)}>
              ×
            </button>
            
            <div className={styles.modalGrid}>
              {/* Image Column */}
              {selectedEvent.image && (
                <div className={styles.modalImageContainer}>
                  <OptimizedImage
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className={styles.modalImage}
                  />
                </div>
              )}

              {/* Content Column - adjust grid if no image */}
              <div className={styles.modalInfo} style={!selectedEvent.image ? { gridColumn: 'span 2' } : {}}>
                <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>
                
                {selectedEvent.subtitle && (
                  <h3 className={styles.modalSubtitle}>{selectedEvent.subtitle}</h3>
                )}

                {/* <div className={styles.modalMeta}>
                  <span className={styles.modalMetaItem}>
                    📅 {formatDate(selectedEvent.start)}
                    {selectedEvent.end && ` - ${formatDate(selectedEvent.end)}`}
                  </span>
                  
                  {selectedEvent.location && (
                    <span className={styles.modalMetaItem}>
                      📍 {selectedEvent.location}
                    </span>
                  )}
                </div> */}

                {selectedEvent.description && (
                  <p className={styles.modalDescription}>{selectedEvent.description}</p>
                )}

                <div className={styles.modalTags}>
                  {selectedEvent.school && (
                    <span className={styles.modalTag}>
                      🏫 {selectedEvent.school}
                    </span>
                  )}
                  {selectedEvent.category && (
                    <span className={styles.modalTag}>
                      🏆 {categories.find(c => c.id === selectedEvent.category)?.label}
                    </span>
                  )}
                </div>

                {selectedEvent.participate && (
                  <div className={styles.modalParticipants}>
                    <h4>Participan do Club Treboada:</h4>
                    <p>{selectedEvent.participate}</p>
                  </div>
                )}

                <div className={styles.modalButtons}>
                  {selectedEvent.eventUrl && (
                    <a 
                      href={selectedEvent.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.modalButton} ${styles.primaryButton}`}
                    >
                      Saber máis
                    </a>
                  )}
                  
                  {selectedEvent.streaming && (
                    <a 
                      href={selectedEvent.streaming}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.modalButton} ${styles.secondaryButton}`}
                    >
                      Streaming
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioPage;