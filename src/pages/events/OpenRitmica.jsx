// src/pages/OpenRitmica.jsx
import React from 'react';
import EventTemplate from './EventTemplate';
import styles from './OpenRitmica.module.css';
import openRitmicaData from '../../data/openRitmicaData';

const OpenRitmica = () => {
  return (
    <EventTemplate {...openRitmicaData}>
      <div className={styles.highlightBox}>
        <h4>Detalles del Evento</h4>
        <ul>
          <li>🏆 Modalidades: Individual y Conjuntos</li>
          <li>🎯 Niveles: Base y Absoluto</li>
          <li>📍 Pabellón Municipal dos Deportes de Pontevedra</li>
          <li>⏰ Jornada de mañana y tarde</li>
        </ul>
      </div>
    </EventTemplate>
  );
};

export default OpenRitmica;