// src/pages/HomePage/components/DisciplinasSection.jsx
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../components/OptimizedImage';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import SectionTitle from '../../../components/UI/SectionTitle';
import Section from '../../../components/UI/Section';
import disciplinasData from '../../../data/disciplinesData';
import styles from './DisciplinasSection.module.css';

const DisciplinaCard = ({ disciplina }) => {
  return (
    <Link to={disciplina.link} className={styles.cardLink}>
      <Card hoverEffect={true} className={styles.disciplinaCard}>
        <div className={styles.iconContainer}>
          <OptimizedImage 
            src={disciplina.icon}
            alt={disciplina.alt}
            className={styles.icon}
          />
        </div>
        
        <h3 className={styles.title}>{disciplina.name}</h3>
        
        <p className={styles.description}>{disciplina.description}</p>
        
        <span className={styles.readMore}>
          Saber máis <span className={styles.arrow}>→</span>
        </span>
      </Card>
    </Link>
  );
};

const DisciplinasSection = () => {
  return (
    <Section id="disciplinas" background="gradient">
      <SectionTitle 
        title="As Nosas Disciplinas"
        subtitle="Descubre todo o que podemos ofrecerche"
        align="center"
      />

      <div className={styles.grid}>
        {disciplinasData.map((disciplina) => (
          <DisciplinaCard key={disciplina.id} disciplina={disciplina} />
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <Button
          href="https://forms.gle/Wa6C1DAAoR1B43NQ7"
          external={true}
          variant="primary"
          size="large"
        >
          Ficha de Inscrición do Club Treboada
          <span className={styles.buttonArrow}>→</span>
        </Button>
      </div>
    </Section>
  );
};

export default DisciplinasSection;