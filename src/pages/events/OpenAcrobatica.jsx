// src/pages/OpenAcrobatica.jsx
import React from 'react';
import EventTemplate from './EventTemplate';
import openAcrobaticaData from '../../data/openAcrobaticaData';
import { openAcrobaticaCategories } from '../../data/openAcrobaticaCategoriesData';
import Card from '../../components/UI/Card';
import styles from './EventTemplate.module.css';

const OpenAcrobatica = () => {
  return (
    <EventTemplate {...openAcrobaticaData}>
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