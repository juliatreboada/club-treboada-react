-- =============================================================================
-- Club Treboada - Seed discipline_groups from legacy disciplinesInfoData.js
-- =============================================================================
-- Run after discipline_groups.sql. Truncates existing rows.

truncate public.discipline_groups cascade;

-- -----------------------------------------------------------------------------
-- Rítmica
-- -----------------------------------------------------------------------------

insert into public.discipline_groups
  (discipline_id, group_key, name, age, days, hours, pavilion, price_activity, price_license, contact, extra_notes, photo_url, sort_order, status)
values
  (
    'ritmica', 'iniciacion', 'Grupo Iniciación',
    'mínimo 3 anos', 'Martes e Xoves', '17:30 - 18:30', 'Príncipe Felipe',
    '42€/mes', '30€/ano', 'Sara 634 04 98 80  -  Laura 613 99 07 13', null,
    '/images/rit/rit-ini/Diapositiva1.jpg', 1, 'active'
  ),
  (
    'ritmica', 'escolar', 'Grupo Escolar',
    'mínimo 6 anos', 'Luns, Mércores e Venres', '18:00 - 20:00', 'Cabanas - Salcedo',
    '48€/mes', '30€/ano', 'Sara 634 04 98 80  -  Laura 613 99 07 13', null,
    '/images/rit/rit-esc/Diapositiva1.jpg', 2, 'active'
  ),
  (
    'ritmica', 'promocion', 'Grupos Promoción',
    'mínimo 6 anos', 'Luns, Mércores e Venres', '18:00 - 21:00', 'Cabanas - Salcedo',
    '48€/mes', '30€/ano ou 60€/ano', 'Sara 634 04 98 80  -  Laura 613 99 07 13', null,
    '/images/rit/rit-prom/Diapositiva1.jpeg', 3, 'active'
  ),
  (
    'ritmica', 'base', 'Grupos Base e Federado',
    'mínimo 7 anos', 'Martes, Xoves, Venres e Sábado',
    'Martes e Xoves 17:30 - 21:00 (Príncipe Felipe); Venres 16:00 - 19:00 (Cabanas - Salcedo); Sábado 10:00 - 14:00 (Cabanas - Salcedo)',
    null, '54€/mes', '110€/ano', 'Sara 634 04 98 80  -  Laura 613 99 07 13', null,
    '/images/rit/rit-base-abs/Diapositiva1.jpg', 4, 'active'
  );

-- -----------------------------------------------------------------------------
-- Acrobática
-- -----------------------------------------------------------------------------

insert into public.discipline_groups
  (discipline_id, group_key, name, age, days, hours, pavilion, price_activity, price_license, contact, extra_notes, photo_url, sort_order, status)
values
  (
    'acrobatica', 'escolar', 'Grupo Escolar',
    'a partir de 4 anos', 'Martes e Xoves', '18:15 - 20:15', 'Pavillón Municipal dos Deportes de Pontevedra',
    '42€/mes', '30€/ano', 'Eva 627 42 90 24', null,
    '/images/acro/acro-esc/Diapositiva1.jpg', 1, 'active'
  ),
  (
    'acrobatica', 'autonomico', 'Grupo Autonómico',
    'a partir de 7 anos', null,
    'Luns e Mércores 18:00-20:00 (Cabanas-Salcedo); Xoves 18:00-20:00 (Pontevedra)',
    null, '48€/mes', '60€/ano', 'Eva 627 42 90 24', null,
    '/images/acro/acro-aut/Diapositiva1.jpg', 2, 'active'
  ),
  (
    'acrobatica', 'nacional', 'Grupo Nacional',
    'a partir de 7 anos', null,
    'Luns e Mércores 18:00 - 21:00 (Cabanas-Salcedo); Sábado 10:00 - 13:00 (Cabanas-Salcedo); Martes ou Xoves 18:00-20:00 (Pontevedra)',
    null, '54€/mes', '110€/ano', 'Eva 627 42 90 24', null,
    '/images/acro/acro-nac/Diapositiva1.jpg', 3, 'active'
  );

-- -----------------------------------------------------------------------------
-- Trampolín
-- -----------------------------------------------------------------------------

insert into public.discipline_groups
  (discipline_id, group_key, name, age, days, hours, pavilion, price_activity, price_license, contact, extra_notes, photo_url, sort_order, status)
values
  (
    'trampolin', 'trampolin', 'Grupo Trampolín',
    'mínimo 6 anos', 'Martes, Xoves, Venres e Sábado',
    'Martes, Xoves e Venres 19:00 - 21:00; Sábado 10:00 - 12:00', 'Cabanas - Salcedo',
    '42€/mes (2 días) - 48€/mes (3 días) - 54€/mes (4 días)', '60€/ano', 'Eva 627 42 90 24', null,
    '/images/tra/tra1.webp', 1, 'active'
  );
