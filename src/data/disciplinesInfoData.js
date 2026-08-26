// src/data/disciplinesInfoData.js
const disciplinesData = {
  ritmica: {
    name: 'Ximnasia Rítmica',
    breadcrumb: 'Ximnasia Rítmica',
    openLink: "/open-ritmica",
    openText: "Torneo Treboada Rítmica",
    groups: [
      {
        id: 'iniciacion',
        name: 'Grupo Iniciación',
        images: [
          '/images/rit/rit-ini/Diapositiva1.jpg',
          // '/images/rit/rit-ini/Diapositiva2.jpg',
          // '/images/rit/rit-ini/Diapositiva3.jpg',
          // '/images/rit/rit-ini/Diapositiva4.jpg',
        ],
        details: [
          { label: 'Edad', value: 'mínimo 3 anos' },
          { label: 'Días', value: 'Martes e Xoves' },
          { label: 'Horario', value: '17:30 - 18:30' },
          { label: 'Pavillón', value: 'Príncipe Felipe' },
          { label: 'Precio Actividade', value: '42€/mes' },
          { label: 'Precio Licencia', value: '30€/ano' },
          { label: 'Contacto', value: 'Sara 634 04 98 80  -  Laura 613 99 07 13' }
        
        ]
      },
      {
        id: 'escolar',
        name: 'Grupo Escolar',
        images: [
          '/images/rit/rit-esc/Diapositiva1.jpg',
          // '/images/rit/rit-esc/Diapositiva2.jpg',
          // '/images/rit/rit-esc/Diapositiva3.jpg'
        ],
        details: [
          { label: 'Edad', value: 'mínimo 6 anos' },
          { label: 'Días', value: 'Luns, Mércores e Venres' },
          { label: 'Horario', value: '18:00 - 20:00' },
          { label: 'Pavillón', value: 'Cabanas - Salcedo' },
          { label: 'Precio Actividade', value: '48€/mes' },
          { label: 'Precio Licencia', value: '30€/ano' },
          { label: 'Contacto', value: 'Sara 634 04 98 80  -  Laura 613 99 07 13' }
        ]
      },
      {
        id: 'promocion',
        name: 'Grupos Promoción',
        images: [
          '/images/rit/rit-prom/Diapositiva1.jpeg',
          // '/images/rit/rit-prom/Diapositiva2.jpeg',
          // '/images/rit/rit-prom/Diapositiva3.jpeg',
          // '/images/rit/rit-prom/Diapositiva4.jpeg',
          // '/images/rit/rit-prom/Diapositiva5.jpeg',
        ],
        details: [
          { label: 'Edad', value: 'mínimo 6 anos' },
          { label: 'Días', value: 'Luns, Mércores e Venres' },
          { label: 'Horario', value: '18:00 - 21:00' },
          { label: 'Pavillón', value: 'Cabanas - Salcedo' },
          { label: 'Precio Actividade', value: '48€/mes' },
          { label: 'Precio Licencia', value: '30€/ano ou 60€/ano' },
          { label: 'Contacto', value: 'Sara 634 04 98 80  -  Laura 613 99 07 13' }
        ]
      },
      {
        id: 'base',
        name: 'Grupos Base e Federado',
        images: [
          '/images/rit/rit-base-abs/Diapositiva1.jpg',
          // '/images/rit/rit-base-abs/Diapositiva2.jpg',
          // '/images/rit/rit-base-abs/Diapositiva3.jpg',
          // '/images/rit/rit-base-abs/Diapositiva4.jpg',
          // '/images/rit/rit-base-abs/Diapositiva5.jpg',
        ],
        details: [
          { label: 'Edad', value: 'mínimo 7 anos' },
          { label: 'Martes e Xoves', value: '17:30 - 21:00 - Pavillón Príncipe Felipe' },
          { label: 'Venres', value: '16:00 - 19:00 - Pavillón de Cabanas - Salcedo' },
          { label: 'Sábado', value: '10:00 - 14:00 - Pavillón de Cabanas - Salcedo' },
          { label: 'Precio Actividade', value: '54€/mes' },
          { label: 'Precio Licencia', value: '110€/ano' },
          { label: 'Contacto', value: 'Sara 634 04 98 80  -  Laura 613 99 07 13' }
        ]
      }
    ],
    maps: [
      {
        title: 'Pavillón de Cabanas Salcedo',
        src: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5891.549965320541!2d-8.650458800329872!3d42.41123636274057!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f703a6d29582d%3A0x3c7f47b7c657565a!2sPavill%C3%B3n%20Municipal%20Cabanas-Salcedo!5e0!3m2!1ses!2ses!4v1725091812777!5m2!1ses!2ses'
      },
      {
        title: 'Pavillón de Príncipe Felipe',
        src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d23560.463590836054!2d-8.64971962089845!3d42.42650140000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f7100bf8f92e7%3A0xffb2fc783e005a4c!2sPavill%C3%B3n%20Pr%C3%ADncipe%20Felipe%20-%20Pontevedra!5e0!3m2!1ses!2ses!4v1677843349070!5m2!1ses!2ses'
      }
    ]
  },
  acrobatica: {
    name: 'Ximnasia Acrobática',
    breadcrumb: 'Ximnasia Acrobática',
    openLink: "/open-acrobatica",
    openText: "Open Treboada",
    openIcon: "/images/open-acro/open-blanco.png",
    groups: [
      {
        id: 'escolar',
        name: 'Grupo Escolar',
        images: [
          '/images/acro/acro-esc/Diapositiva1.jpg',
          // '/images/acro/acro-esc/Diapositiva2.jpg',
          // '/images/acro/acro-esc/Diapositiva3.jpg',
          // '/images/acro/acro-esc/Diapositiva4.jpg',
        ],
        details: [
          { label: 'Edad', value: 'a partir de 4 anos' },
          { label: 'Días', value: 'Martes e Xoves' },
          { label: 'Horario', value: '18:15 - 20:15' },
          { label: 'Precio Actividade', value: '42€/mes' },
          { label: 'Precio Licencia', value: '30€/ano' },
          { label: 'Ubicación', value: 'Pavillón Municipal dos Deportes de Pontevedra' },
          { label: 'Contacto', value: 'Eva 627 42 90 24' }
        ]
      },
      {
        id: 'autonomico',
        name: 'Grupo Autonómico',
        images: [
          '/images/acro/acro-aut/Diapositiva1.jpg',
          // '/images/acro/acro-aut/Diapositiva2.jpg',
          // '/images/acro/acro-aut/Diapositiva3.jpg',
          // '/images/acro/acro-aut/Diapositiva4.jpg',
        ],
        details: [
          { label: 'Edad', value: 'a partir de 7 anos' },
          { label: 'Horario', value: 'Luns e Mércores 18:00-20:00 (Cabanas-Salcedo)' },
          { label: 'Horario', value: 'Xoves 18:00-20:00 (Pontevedra)' },
          { label: 'Precio Actividade', value: '48€/mes' },
          { label: 'Precio Licencia', value: '60€/ano' },
          { label: 'Contacto', value: 'Eva 627 42 90 24' }
        ]
      },
      {
        id: 'nacional',
        name: 'Grupo Nacional',
        images: [
          '/images/acro/acro-nac/Diapositiva1.jpg',
          // '/images/acro/acro-nac/Diapositiva2.jpg',
          // '/images/acro/acro-nac/Diapositiva3.jpg',
          // '/images/acro/acro-nac/Diapositiva4.jpg',
        ],
        details: [
          { label: 'Edad', value: 'a partir de 7 anos' },
          { label: 'Horario', value: 'Luns e Mércores 18:00 - 21:00 (Cabanas-Salcedo)' },
          { label: 'Horario', value: 'Sábado 10:00 - 13:00 (Cabanas-Salcedo)' },
          { label: 'Horario', value: 'Martes ou Xoves 18:00-20:00 (Pontevedra)' },
          { label: 'Precio Actividade', value: '54€/mes' },
          { label: 'Precio Licencia', value: '110€/ano' },
          { label: 'Contacto', value: 'Eva 627 42 90 24' }
        ]
      }
    ],
    maps: [
      {
        title: 'Pavillón de Cabanas Salcedo',
        src: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5891.549965320541!2d-8.650458800329872!3d42.41123636274057!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f703a6d29582d%3A0x3c7f47b7c657565a!2sPavill%C3%B3n%20Municipal%20Cabanas-Salcedo!5e0!3m2!1ses!2ses!4v1725091812777!5m2!1ses!2ses'
      },
      {
        title: 'Pavillón Municipal dos Deportes de Pontevedra',
        src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11778.32720831841!2d-8.651877390761614!3d42.43663569999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f71c13f68a391%3A0x5ae8354680164f51!2sPavill%C3%B3n%20Municipal%20dos%20Deportes%20de%20Pontevedra!5e0!3m2!1ses!2ses!4v1677844518728!5m2!1ses!2ses'
      }
    ]
  },
  trampolin: {
    name: 'Ximnasia Trampolín',
    breadcrumb: 'Ximnasia Trampolín',
    groups: [
      {
        id: 'trampolin',
        name: 'Grupo Trampolín',
        images: [
          '/images/tra/tra1.webp'
        ],
        details: [
          { label: 'Edad', value: 'mínimo 6 anos' },
          { label: 'Días', value: 'Martes, Xoves, Venres' },
          { label: 'Horario', value: '19:00 - 21:00' },
          { label: 'Días', value: 'Sábado' },
          { label: 'Horario', value: '10:00 - 12:00' },
          { label: 'Ubicación', value: 'Pavillón Cabanas - Salcedo' },
          { label: 'Precio Actividade', value: '42€/mes (2 días) - 48€/mes (3 días) - 54€/mes (4 días)' },
          { label: 'Precio Licencia', value: '60€/ano' },
          { label: 'Contacto', value: 'Eva 627 42 90 24' }
        ]
      }
    ],
    maps: [
      {
        title: 'Pavillón de Cabanas Salcedo',
        src: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5891.549965320541!2d-8.650458800329872!3d42.41123636274057!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f703a6d29582d%3A0x3c7f47b7c657565a!2sPavill%C3%B3n%20Municipal%20Cabanas-Salcedo!5e0!3m2!1ses!2ses!4v1725091812777!5m2!1ses!2ses'
      },
      {
        title: 'Pavillón Municipal dos Deportes de Pontevedra',
        src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11778.32720831841!2d-8.651877390761614!3d42.43663569999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f71c13f68a391%3A0x5ae8354680164f51!2sPavill%C3%B3n%20Municipal%20dos%20Deportes%20de%20Pontevedra!5e0!3m2!1ses!2ses!4v1677844518728!5m2!1ses!2ses'
      }
    ]
  }
};

export default disciplinesData;