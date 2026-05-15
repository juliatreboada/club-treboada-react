// src/pages/admin/CalendarAdminPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, schools } from '../../config/calendarTaxonomy';
import { deleteEvent, listEvents } from '../../lib/calendarRepository';
import EventFormModal from '../../components/calendar/EventFormModal';
import styles from './CalendarAdminPage.module.css';

const formatRange = (start, end) => {
  if (!start) return '—';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const a = new Date(start).toLocaleDateString('gl-ES', opts);
  if (!end || end === start) return a;
  const b = new Date(end).toLocaleDateString('gl-ES', opts);
  return `${a} – ${b}`;
};

const CalendarAdminPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await listEvents();
    if (error) {
      console.error('[admin-calendar]', error);
      setFetchError(error.message || 'Non se puideron cargar os eventos.');
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- mount fetch sets loading via load() */
  useEffect(() => {
    void load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const years = useMemo(() => {
    const ys = new Set();
    for (const r of rows) {
      if (r.start_date) ys.add(String(r.start_date).slice(0, 4));
    }
    return Array.from(ys).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (yearFilter !== 'all') {
        const y = String(r.start_date || '').slice(0, 4);
        if (y !== yearFilter) return false;
      }
      if (categoryFilter !== 'all') {
        if ((r.category || '') !== categoryFilter) return false;
      }
      if (schoolFilter !== 'all') {
        if ((r.school || '') !== schoolFilter) return false;
      }
      return true;
    });
  }, [rows, yearFilter, categoryFilter, schoolFilter]);

  const openCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Eliminar o evento «${row.title}»? Esta acción non se pode desfacer.`
      )
    ) {
      return;
    }
    const { error } = await deleteEvent(row.id);
    if (error) {
      window.alert(error.message || 'Non se puido eliminar.');
      return;
    }
    load();
  };

  const categoryLabel = (id) =>
    categories.find((c) => c.id === id)?.label || id;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Xestión do calendario</h1>
            <p className={styles.subtitle}>
              Crear, editar ou eliminar eventos visibles en{' '}
              <Link to="/calendario">/calendario</Link>.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={load}
              disabled={loading}
            >
              Actualizar
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={openCreate}
            >
              Nova entrada
            </button>
          </div>
        </header>

        {fetchError && (
          <div className={styles.errorBanner} role="alert">
            {fetchError}
          </div>
        )}

        <section className={styles.toolbar}>
          <div className={styles.filter}>
            <span className={styles.filterLabel}>Ano</span>
            <select
              className={styles.select}
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <span className={styles.filterLabel}>Modalidade</span>
            <div className={styles.chipRow}>
              <button
                type="button"
                className={`${styles.chip} ${
                  categoryFilter === 'all' ? styles.chipActive : ''
                }`}
                onClick={() => setCategoryFilter('all')}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.chip} ${
                    categoryFilter === c.id ? styles.chipActive : ''
                  }`}
                  onClick={() => setCategoryFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filter}>
            <span className={styles.filterLabel}>Escola</span>
            <div className={styles.chipRow}>
              <button
                type="button"
                className={`${styles.chip} ${
                  schoolFilter === 'all' ? styles.chipActive : ''
                }`}
                onClick={() => setSchoolFilter('all')}
              >
                Todas
              </button>
              {schools.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.chip} ${
                    schoolFilter === s.label ? styles.chipActive : ''
                  }`}
                  onClick={() => setSchoolFilter(s.label)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <p className={styles.loading}>Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>
            Non hai eventos con estes filtros. Crea un novo ou cambia os
            filtros.
          </p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((row) => (
              <article key={row.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {row.image_url ? (
                    <img src={row.image_url} alt="" />
                  ) : (
                    <span className={styles.cardImagePlaceholder}>📅</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h2 className={styles.cardTitle}>{row.title}</h2>
                  <p className={styles.cardDates}>
                    {formatRange(row.start_date, row.end_date)}
                  </p>
                  <div className={styles.tags}>
                    {row.category && (
                      <span className={styles.tag}>
                        {categoryLabel(row.category)}
                      </span>
                    )}
                    {row.school && (
                      <span className={styles.tag}>{row.school}</span>
                    )}
                    {row.location && (
                      <span className={styles.tag}>{row.location}</span>
                    )}
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => openEdit(row)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => handleDelete(row)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <EventFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        initialRow={editingRow}
        onSaved={load}
      />
    </div>
  );
};

export default CalendarAdminPage;
