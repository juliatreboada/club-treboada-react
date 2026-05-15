// src/data/campData.js
// All the camp content lives here. Edit any field below and it will update
// automatically on the /campamento page, the registration form, the success
// screen and the receipt PDF.

// Weekly prices for camp (also hard-coded in supabase/012_registration_rpc.sql
// and 013_registration_kids_member_rate.sql — keep all three in sync).
const campData = {
  // Hero / general info
  title: 'Campamento de verán Treboada',
  edition: '2026',
  subtitle: 'Diversión, deporte e amizade durante o verán',
  shortDates: 'Xullo 2026',
  dates: '20 – 31 de xullo de 2026',
  ageRange: '6 – 16 anos',
  schedule: '9:00 – 14:00',
  location: 'Pavillón Cabanas Salcedo, Pontevedra',

  // Home hero: same image as the carousel slide that links to /campamento (JPEG under public/images/camp/)
  heroCampImageSrc: '/images/camp/campamento-hero.jpeg',
  heroCampImageAlt: 'Campamento de verán Treboada',

  // Available weeks. Parents can choose one or both for each kid.
  weeks: [
    {
      id: 'week1',
      label: 'Semana 1',
      shortDates: '20–24 xullo',
      dates: 'Do 20 ao 24 de xullo de 2026',
    },
    {
      id: 'week2',
      label: 'Semana 2',
      shortDates: '27–31 xullo',
      dates: 'Do 27 ao 31 de xullo de 2026',
    },
  ],

  // Pricing per kid per week (a kid on two weeks pays 2× the weekly rate)
  pricePerKidPerWeek: 90, // € — non-members / xeral
  priceMemberPerKidPerWeek: 60, // € — gymnasts who are Club Treboada members
  currency: '€',

  // Minimum registrations needed per week to actually run the camp
  minRegistrations: 10,

  // Deadlines
  registrationDeadline: '15 de xuño de 2026',

  // What\u2019s included in the price
  includes: [
    'Actividades de ximnasia (rítmica, acrobática e trampolín)',
    'Xogos cooperativos e dinámicas en grupo',
    'Adestradores titulados e con experiencia',
  ],

  // What kids should bring each day
  toBring: [
    'Roupa cómoda e deportiva',
    'Calzado deportivo',
    'Auga',
    'Almorzo a media mañá (froita, bocadillo…)',
  ],

  // Typical day schedule
  dailySchedule: [
    { time: '9:00 – 11:30', activity: 'Quecemento e ximnasia' },
    { time: '11:30 – 12:00', activity: 'Almorzo a media mañá' },
    { time: '12:00 – 14:00', activity: 'Xogos cooperativos e traballo específico' },
  ],

  // Bank info for the transfer (placeholders - fill with real data)
  bankInfo: {
    accountHolder: 'Club Treboada',
    iban: 'ES31 0182 5150 8202 0175 1568',
    bank: 'BBVA',
  },

  // Numbered guide: how registration works (shown on /campamento before the form)
  registrationSteps: [
    {
      title: 'Enche o formulario e envía a inscrición',
      body:
        'Completa os datos do titor ou titores e de cada neno/a (semanas, etc.) e preme para enviar a solicitude.',
    },
    {
      title: 'Descarga o comprobante e conserva o código',
      body:
        'Descarga o PDF de confirmación e garda o código de referencia: debes indicalo no concepto da transferencia bancaria.',
    },
    {
      title: 'Agarda o correo do Club Treboada',
      body:
        'Recibirás un correo electrónico do club confirmando que temos a túa solicitude e o estado da inscrición.',
    },
    {
      title: 'Prazo de 5 días para o ingreso',
      body:
        'A partir do correo de confirmación, tes 5 días naturais para facer o pago. Se non ingresas a tempo, enviarase un aviso e a praza reservada quedará libre.',
    },
    {
      title: 'Confirmación e benvida',
      body:
        'Cando recibamos o teu ingreso, enviarémosche un correo confirmando o pago e dándoche a benvida ao campamento de verán Treboada.',
    },
  ],

  // Important notes shown on the page and in the receipt
  importantNotes: [
    'As ximnastas/os socias do Club Treboada teñen tarifa reducida (60€/semana); o resto de participantes, 90€/semana. Marca a casilla correspondente no formulario.',
    'É necesario un mínimo de 10 inscricións por semana para que o campamento se poida realizar.',
    'Prazas limitadas; resérvanse por orde de inscrición.',
    'A inscrición considérase confirmada cando se recibe o ingreso bancario.',
    'Indica o código de inscrición no concepto da transferencia para que poidamos identificalo facilmente.',
  ],
};

export default campData;
