// src/pages/admin/HeroSlidesAdminPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listHeroSlidesForAdmin,
  reorderSlides,
  setSlideStatus,
  softDeleteSlide,
} from '../../lib/heroSlidesRepository';
import HeroSlideFormModal from '../../components/hero/HeroSlideFormModal';
import styles from './HeroSlidesAdminPage.module.css';

const slideKindLabel = (type) =>
  type === 'icons' ? 'Iconas' : 'Imaxe';

const statusLabel = (s) => {
  if (s === 'disabled') return 'Desactivado';
  if (s === 'deleted') return 'Eliminado';
  return 'Activo';
};

const HeroSlidesAdminPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await listHeroSlidesForAdmin();
    if (error) {
      console.error('[admin-hero]', error);
      setFetchError(error.message || 'Non se puideron cargar os slides.');
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

  const mainRows = useMemo(() => {
    return rows
      .filter((r) => r.status !== 'deleted')
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [rows]);

  const deletedRows = useMemo(() => {
    return rows
      .filter((r) => r.status === 'deleted')
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updated_at || 0).getTime() -
          new Date(a.updated_at || 0).getTime()
      );
  }, [rows]);

  const nextSortOrder = useMemo(() => {
    const max = mainRows.reduce(
      (acc, r) =>
        typeof r.sort_order === 'number' && r.sort_order > acc
          ? r.sort_order
          : acc,
      0
    );
    return max + 1;
  }, [mainRows]);

  const openCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleSoftDelete = async (row) => {
    const label =
      row.slide_type === 'icons'
        ? 'esta fila de iconas'
        : `o slide «${row.alt_text || row.image_url || row.id.slice(0, 6)}»`;
    if (
      !window.confirm(
        `Marcar como eliminado ${label}? Deixará de aparecer no carrusel e na lista principal; podes restauralo máis tarde.`
      )
    ) {
      return;
    }
    const { error } = await softDeleteSlide(row.id);
    if (error) {
      window.alert(error.message || 'Non se puido eliminar.');
      return;
    }
    load();
  };

  const handleRestore = async (row) => {
    const { error } = await setSlideStatus(row.id, 'disabled');
    if (error) {
      window.alert(error.message || 'Non se puido restaurar.');
      return;
    }
    load();
  };

  const handleDisable = async (row) => {
    const { error } = await setSlideStatus(row.id, 'disabled');
    if (error) {
      window.alert(error.message || 'Non se puido desactivar.');
      return;
    }
    load();
  };

  const handleActivate = async (row) => {
    const { error } = await setSlideStatus(row.id, 'active');
    if (error) {
      window.alert(error.message || 'Non se puido activar.');
      return;
    }
    load();
  };

  const move = async (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= mainRows.length) return;
    const newOrder = mainRows.slice();
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(target, 0, moved);
    setReordering(true);
    const { error } = await reorderSlides(newOrder.map((r) => r.id));
    setReordering(false);
    if (error) {
      window.alert(error.message || 'Non se puido reordenar.');
      load();
    } else {
      load();
    }
  };

  const renderPreview = (row) => {
    if (row.slide_type === 'icons') {
      const icons = Array.isArray(row.icons_json) ? row.icons_json : [];
      if (icons.length === 0) {
        return <span className={styles.placeholder}>🖼️</span>;
      }
      return (
        <div className={styles.iconStack}>
          {icons.slice(0, 4).map((icon, i) => (
            <img key={i} src={icon.src} alt={icon.alt || ''} />
          ))}
        </div>
      );
    }
    if (row.image_url) {
      return <img src={row.image_url} alt={row.alt_text || ''} />;
    }
    return <span className={styles.placeholder}>🖼️</span>;
  };

  const renderRowCard = (row, index, { deleted } = { deleted: false }) => {
    const st = row.status || 'active';
    const badgeClass =
      st === 'active'
        ? styles.badgeActive
        : st === 'disabled'
          ? styles.badgeDisabled
          : styles.badgeDeleted;

    return (
      <article
        key={row.id}
        className={`${styles.row} ${st === 'disabled' ? styles.rowMuted : ''} ${deleted ? styles.rowDeleted : ''}`}
      >
        {!deleted ? (
          <div className={styles.order}>
            <span>{index + 1}</span>
            <div className={styles.orderButtons}>
              <button
                type="button"
                className={styles.orderBtn}
                onClick={() => move(index, -1)}
                disabled={index === 0 || reordering}
                aria-label="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.orderBtn}
                onClick={() => move(index, +1)}
                disabled={index === mainRows.length - 1 || reordering}
                aria-label="Baixar"
              >
                ↓
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.orderPlaceholder} aria-hidden />
        )}
        <div className={styles.preview}>{renderPreview(row)}</div>
        <div className={styles.info}>
          <div className={styles.kindRow}>
            <span className={styles.kind}>{slideKindLabel(row.slide_type)}</span>
            <span className={`${styles.badge} ${badgeClass}`}>
              {statusLabel(st)}
            </span>
          </div>
          <p className={styles.rowTitle}>
            {row.slide_type === 'icons'
              ? `${Array.isArray(row.icons_json) ? row.icons_json.length : 0} iconas`
              : row.alt_text || 'Sen descrición'}
          </p>
          <p className={styles.rowMeta}>
            {row.slide_type === 'icons'
              ? '—'
              : row.link_url
                ? `${row.link_url}${row.link_external ? ' (externo)' : ''}`
                : 'Sen ligazón'}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => openEdit(row)}
          >
            Editar
          </button>
          {deleted ? (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => handleRestore(row)}
            >
              Restaurar
            </button>
          ) : (
            <>
              {st === 'active' && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => handleDisable(row)}
                >
                  Ocultar
                </button>
              )}
              {st === 'disabled' && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => handleActivate(row)}
                >
                  Mostrar no carrusel
                </button>
              )}
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => handleSoftDelete(row)}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Carrusel da portada</h1>
            <p className={styles.subtitle}>
              Activo = visíbel no inicio; desactivado = gardado sen mostrar;
              eliminado = fóra do carrusel (recuperábel aquí). O público só ve
              os activos en <Link to="/">inicio</Link>.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={load}
              disabled={loading || reordering}
            >
              Actualizar
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={openCreate}
            >
              Novo slide
            </button>
          </div>
        </header>

        <section className={styles.toolbar}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            Mostrar eliminados ({deletedRows.length})
          </label>
        </section>

        {fetchError && (
          <div className={styles.errorBanner} role="alert">
            {fetchError}
          </div>
        )}

        {loading ? (
          <p className={styles.loading}>Cargando…</p>
        ) : rows.length === 0 ? (
          <p className={styles.empty}>
            Non hai slides aínda. Crea o primeiro co botón «Novo slide».
          </p>
        ) : (
          <>
            {mainRows.length === 0 ? (
              <p className={styles.empty}>
                Non hai slides activos nin ocultos. Activa «Mostrar eliminados»
                se borraches algún.
              </p>
            ) : (
              <div className={styles.list}>
                {mainRows.map((row, index) =>
                  renderRowCard(row, index, { deleted: false })
                )}
              </div>
            )}

            {showDeleted && deletedRows.length > 0 && (
              <section className={styles.deletedSection}>
                <h2 className={styles.deletedHeading}>Eliminados</h2>
                <p className={styles.deletedHint}>
                  Non aparecen no carrusel. Restaurar devolve o estado a
                  «Desactivado»; despois podes volver a «Mostrar no carrusel».
                </p>
                <div className={styles.list}>
                  {deletedRows.map((row) =>
                    renderRowCard(row, 0, { deleted: true })
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <HeroSlideFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        initialRow={editingRow}
        nextSortOrder={nextSortOrder}
        onSaved={load}
      />
    </div>
  );
};

export default HeroSlidesAdminPage;
