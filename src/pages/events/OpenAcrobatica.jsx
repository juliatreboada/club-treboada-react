// src/pages/OpenAcrobatica.jsx
import React from 'react';
import EventTemplate from './EventTemplate';
import openAcrobaticaData from '../../data/openAcrobaticaData';
import { openAcrobaticaCategories } from '../../data/openAcrobaticaCategoriesData';
import { openAcrobaticaWinnersInfo, openAcrobaticaWinners } from '../../data/openAcrobaticaWinnersData';
import Card from '../../components/UI/Card';
import OptimizedImage from '../../components/OptimizedImage';
import styles from './EventTemplate.module.css';

const OpenAcrobatica = () => {
  return (
    <EventTemplate {...openAcrobaticaData}>
      {/* Gañadores da edición deste ano */}
      {openAcrobaticaWinners.length > 0 && (
        <Card hoverEffect={true} className={styles.contactCard}>
          <h4>Gañadores {openAcrobaticaWinnersInfo.edition}</h4>
          <div className={styles.winnersGrid}>
            {openAcrobaticaWinners.map((winner) => (
              <div key={winner.id} className={styles.winnerCard}>
                <OptimizedImage
                  src={winner.photo}
                  alt={`Gañadores ${winner.category}`}
                  className={styles.winnerPhoto}
                />
                <span className={styles.winnerCategory}>{winner.category}</span>
              </div>
            ))}
          </div>
          {openAcrobaticaWinnersInfo.resultsLink && (
            <a
              href={openAcrobaticaWinnersInfo.resultsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resultsLink}
            >
              Ver resultados completos →
            </a>
          )}
        </Card>
      )}

      {/* Categorías e idades do Open Acrobática */}
      <Card hoverEffect={true} className={styles.contactCard}>
        <h4>Categorías e idades</h4>
        {openAcrobaticaCategories.map((group) => (
          <div key={group.id} className={styles.categoryGroup}>
            <div className={styles.categoryGroupTitle}>{group.label}</div>
            <ul className={styles.categoryList}>
              {group.items.map((item) => (
                <li key={item.name} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{item.name}</span>
                  <span className={styles.categoryMeta}>
                    {item.ageRange} · {item.rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </EventTemplate>
  );
};

export default OpenAcrobatica;