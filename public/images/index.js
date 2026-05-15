// src/assets/images/index.js

// Icons (SVGs are best for icons)
import { ReactComponent as RitIcon } from './icons/rit.svg';
import { ReactComponent as AcroIcon } from './icons/acro.svg';
import { ReactComponent as TraIcon } from './icons/tra.svg';
import { ReactComponent as OpenIcon } from './icons/open.svg';
import { ReactComponent as ClubIcon } from './icons/treboada.svg';
import { ReactComponent as ClubWhiteIcon } from './icons/treboada-blanco.svg';

// Events - using dynamic imports for lazy loading
export const events = {
  miac: () => import('./eventos/miac.webp'),
};

// School
export const school = {
  inscricios: () => import('./school/abrimos-inscricios.webp'),
};

// Logos
export const logos = {
  xunta: () => import('./logos/xunta.webp'),
  concello: () => import('./logos/concello.webp'),
  deputacion: () => import('./logos/deputacion.webp'),
  caldas: () => import('./logos/caldas.webp'),
  pontecaldelas: () => import('./logos/pontecaldelas.webp'),
  soutomaior: () => import('./logos/souto.webp'),
};

// Open-rit
export const openRit = {
  openRitCartel: () => import('./open-rit/cartel.webp'),
};

// Open-acro
export const openAcro = {
  openAcroCartel: () => import('./open-acro/cartel.webp'),
};

// Catalog
export const catalog = {
  anorak: () => import('./catalog/anorak.webp'),
};
// Acrobatica
export const acro = {
  acro1: () => import('./acro/nac1.webp'),
};
// Ritmica
export const rit = {
  rit1: () => import('./rit/rit1.webp'),
};
// Trampolin
export const tra = {
  tra1: () => import('./tra/tra1.webp'),
};

// Icons (export as components for inline SVG)
export { RitIcon, AcroIcon, TraIcon, OpenIcon, ClubIcon, ClubWhiteIcon };

// Helper for regular images (not SVG)
export const getImage = (imageImporter) => {
  const [image, setImage] = React.useState(null);
  
  React.useEffect(() => {
    imageImporter().then(setImage);
  }, [imageImporter]);
  
  return image;
};