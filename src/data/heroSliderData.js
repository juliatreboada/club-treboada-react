// src/data/heroSliderData.js
import campData from './campData';

const heroSliderData = [
  {
    id: 1,
    type: 'icons',
    icons: [
      { src: '/images/icons/rit.png', alt: 'Rítmica' },
      { src: '/images/icons/acro.png', alt: 'Acrobática' },
      { src: '/images/icons/tra.png', alt: 'Trampolín' }
    ]
  },
  {
    id: 4,
    type: 'image',
    src: '/images/open-acro/IV-open-blanco.png',
    alt: 'Open Acrobática',
    link: '/open-acrobatica',
    external: false
  },
  {
    id: 2,
    type: 'image',
    src: '/images/school/abrimos-inscricios.webp',
    alt: 'Inscricións escolas',
    link: 'https://www.escolasdeportivastreboada.com',
    external: true
  },
  {
    id: 3,
    type: 'image',
    src: '/images/open-rit/slider-torneo-rit.jpg',
    alt: 'Open Rítmica',
    link: '/open-ritmica',
    external: false
  },
  {
    id: 'camp',
    type: 'image',
    src: campData.heroCampImageSrc,
    alt: campData.heroCampImageAlt,
    link: '/campamento',
    external: false
  }
];

export default heroSliderData;