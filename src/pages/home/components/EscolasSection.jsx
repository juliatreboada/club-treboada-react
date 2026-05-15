// src/pages/HomePage/components/EscolasSection.jsx
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../components/OptimizedImage';
import Card from '../../../components/UI/Card';
import SectionTitle from '../../../components/UI/SectionTitle';
import Section from '../../../components/UI/Section';
import escolasData from '../../../data/escolasData';
import styles from './EscolasSection.module.css';

const EscolaCard = ({ escola }) => {
  const CardContent = (
    <Card hoverEffect={true}>
      <div className={styles.logoContainer}>
        <OptimizedImage 
          src={escola.logo}
          alt={escola.alt}
          className={styles.logo}
        />
      </div>
      
      <h3 className={styles.title}>{escola.name}</h3>
      
      <div className={styles.details}>
        <p className={styles.disciplines}>{escola.disciplines}</p>
        
        <div className={styles.schedule}>
          <p className={styles.days}>{escola.days}</p>
          <p className={styles.time}>{escola.time}</p>
        </div>
        
        <p className={styles.location}>{escola.location}</p>
      </div>
    </Card>
  );

  if (escola.external) {
    return (
      <a 
        href={escola.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
      >
        {CardContent}
      </a>
    );
  }

  return (
    <Link to={escola.link} className={styles.cardLink}>
      {CardContent}
    </Link>
  );
};

const EscolasSection = () => {
  return (
    <Section id="escolas" background="lightAlt">
      <SectionTitle align="center">
        <a 
          href="https://www.escolasdeportivastreboada.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.titleLink}
        >
          <h2>Escolas Deportivas Municipais</h2>
        </a>
      </SectionTitle>

      <div className={styles.grid}>
        {escolasData.map((escola) => (
          <EscolaCard key={escola.id} escola={escola} />
        ))}
      </div>
    </Section>
  );
};

export default EscolasSection;