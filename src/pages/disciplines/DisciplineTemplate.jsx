// src/pages/disciplines/DisciplineTemplate.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from '../../components/UI/Section';
import Button from '../../components/UI/Button';
import GroupCard from './components/GroupCard';
import GroupNav from './components/GroupNav';
import disciplinesData from '../../data/disciplinesInfoData';
import { dbRowToGroup, listActiveDisciplineGroups } from '../../lib/disciplineGroupsRepository';
import styles from './DisciplineTemplate.module.css';

// Summary Component (se mantiene igual)
const DisciplineSummary = ({ groups }) => {
  const totalGroups = groups.length;

  const minAge = Math.min(...groups.map(g => {
    const ageValue = g.age ?? g.details.find(d => d.label === 'Edad')?.value;
    if (ageValue) {
      const match = ageValue.match(/\d+/);
      return match ? parseInt(match[0]) : 99;
    }
    return 99;
  }));

  const contacts = [...new Set(groups.map(g => {
    return g.contact ?? g.details.find(d => d.label === 'Contacto')?.value ?? null;
  }).filter(Boolean))];

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Grupos</span>
        <span className={styles.summaryValue}>{totalGroups}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Idade mínima</span>
        <span className={styles.summaryValue}>{minAge} anos</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Contacto</span>
        <span className={styles.summaryValue}>{contacts.join(' • ')}</span>
      </div>
    </div>
  );
};

const DisciplineTemplate = ({ disciplineId }) => {
  const discipline = disciplinesData[disciplineId];
  const [groups, setGroups] = useState(discipline?.groups ?? []);

  useEffect(() => {
    if (!discipline) return undefined;
    let cancelled = false;
    (async () => {
      const { data, error } = await listActiveDisciplineGroups(disciplineId);
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        if (error) {
          console.warn('[discipline-groups] falling back to static data:', error.message);
        }
        // Fall back to the bundled static data so the page never breaks
        // (network down, table not seeded yet, etc.).
        setGroups(discipline.groups);
      } else {
        setGroups(data.map(dbRowToGroup).filter(Boolean));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [disciplineId, discipline]);

  if (!discipline) {
    return <div>Disciplina non atopada</div>;
  }

  return (
    <>
      {/* Breadcrumbs con botón */}
      <div className={styles.breadcrumbs}>
        <div className="container">
          <div className={styles.breadcrumbRow}>
            <div className={styles.breadcrumbLeft}>
              <ol className={styles.breadcrumbList}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/#disciplinas">Especialidades</Link></li>
                <li>{discipline.breadcrumb}</li>
              </ol>
              <h2 className={styles.pageTitle}>
                Club Treboada - {discipline.name}
              </h2>
            </div>
            
            {/* Botón del Open - solo si existe openLink */}
            {discipline.openLink && (
              <div className={styles.openButton}>
                <Button
                  href={discipline.openLink}
                  external={discipline.openLink.startsWith('http')}
                  variant="primary"
                  size="medium"
                  icon={discipline.openIcon} // ← Pasamos el icono
                  iconPosition="left"
                >
                  {discipline.openText || 'Ver Open'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="container">
        <DisciplineSummary groups={groups} />
      </div>

      {/* Sticky Group Navigation */}
      <GroupNav groups={groups} />

      {/* Groups Section */}
      <Section background="light" className={styles.groupsSection}>
        <div className="container">
          <div className={styles.groupsContainer}>
            {groups.map((group) => (
              <div key={group.id} id={`group-${group.id}`}>
                <GroupCard group={group} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Maps Section */}
      {discipline.maps && discipline.maps.length > 0 && (
        <Section background="lightAlt" className={styles.mapsSection}>
          <div className="container">
            <h3 className={styles.mapsTitle}>Ubicacións</h3>
            <div className={styles.mapsGrid}>
              {discipline.maps.map((map, index) => (
                <div key={index} className={styles.mapItem}>
                  <h4 className={styles.mapName}>{map.title}</h4>
                  <div className={styles.mapContainer}>
                    <iframe
                      src={map.src}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={map.title}
                      className={styles.map}
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
};

export default DisciplineTemplate;