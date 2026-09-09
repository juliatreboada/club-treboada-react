// src/pages/admin/DisciplineGroupsAdminPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listDisciplineGroupsForAdmin,
  reorderGroups,
  setGroupStatus,
  softDeleteGroup,
} from '../../lib/disciplineGroupsRepository';
import DisciplineGroupFormModal from '../../components/discipline/DisciplineGroupFormModal';
import styles from './DisciplineGroupsAdminPage.module.css';

const DISCIPLINES = [
  { id: 'ritmica', label: 'Rítmica', path: '/ritmica' },
  { id: 'acrobatica', label: 'Acrobática', path: '/acrobatica' },
  { id: 'trampolin', label: 'Trampolín', path: '/trampolin' },
];

const statusLabel = (s) => {
  if (s === 'disabled') return 'Desactivado';
  if (s === 'deleted') return 'Eliminado';
  return 'Activo';
};

const DisciplineGroupsAdminPage = () => {
  const [disciplineId, setDisciplineId] = useState(DISCIPLINES[0].id);
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
    const { data, error } = await listDisciplineGroupsForAdmin(disciplineId);
    if (error) {
      console.error('[admin-discipline-groups]', error);
      setFetchError(error.message || 'Non se puideron cargar os grupos.');
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, [disciplineId]);

  /* eslint-disable react-hooks/set-state-in-effect -- mount/tab-change fetch sets loading via load() */
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
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      );
  }, [rows]);

  const nextSortOrder = useMemo(() => {
    const max = mainRows.reduce(
      (acc, r) => (typeof r.sort_order === 'number' && r.sort_order > acc ? r.sort_order : acc),
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
    if (
      !window.confirm(
        `Marcar como eliminado o grupo «${row.name}»? Deixará de aparecer na páxina pública; podes restauralo máis tarde.`
      )
    ) {
      return;
    }
    const { error } = await softDeleteGroup(row.id);
    if (error) {
      window.alert(error.message || 'Non se puido eliminar.');
      return;
    }
    load();
  };

  const handleRestore = async (row) => {
    const { error } = await setGroupStatus(row.id, 'disabled');
    if (error) {
      window.alert(error.message || 'Non se puido restaurar.');
      return;
    }
    load();
  };

  const handleDisable = async (row) => {
    const { error } = await setGroupStatus(row.id, 'disabled');
    if (error) {
      window.alert(error.message || 'Non se puido desactivar.');
      return;
    }
    load();
  };

  const handleActivate = async (row) => {
    const { error } = await setGroupStatus(row.id, 'active');
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
    const { error } = await reorderGroups(newOrder.map((r) => r.id));
    setReordering(false);
    if (error) {
      window.alert(error.message || 'Non se puido reordenar.');
      load();
    } else {
      load();
    }
  };

  const renderRowCard = (row, index, { deleted } = { deleted: false }) => {
    const st = row.status || 'active';
    const badgeClass =
      st === 'active' ? styles.badgeActive : st === 'disabled' ? styles.badgeDisabled : styles.badgeDeleted;

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
        <div className={styles.preview}>
          {row.photo_url ? (
            <img src={row.photo_url} alt="" />
          ) : (
            <span className={styles.placeholder}>📸</span>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.kindRow}>
            <span className={`${styles.badge} ${badgeClass}`}>{statusLabel(st)}</span>
          </div>
          <p className={styles.rowTitle}>{row.name}</p>
          <p className={styles.rowMeta}>
            {[row.days, row.hours].filter(Boolean).join(' · ') || 'Sen horario'}
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={() => openEdit(row)}>
            Editar
          </button>
          {deleted ? (
            <button type="button" className={styles.btnSecondary} onClick={() => handleRestore(row)}>
              Restaurar
            </button>
          ) : (
            <>
              {st === 'active' && (
                <button type="button" className={styles.btnSecondary} onClick={() => handleDisable(row)}>
                  Ocultar
                </button>
              )}
              {st === 'disabled' && (
                <button type="button" className={styles.btnSecondary} onClick={() => handleActivate(row)}>
                  Mostrar na páxina
                </button>
              )}
              <button type="button" className={styles.btnDanger} onClick={() => handleSoftDelete(row)}>
                Eliminar
              </button>
            </>
          )}
        </div>
      </article>
    );
  };

  const activeDiscipline = DISCIPLINES.find((d) => d.id === disciplineId);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Grupos por disciplina</h1>
            <p className={styles.subtitle}>
              Activo = visíbel na páxina pública; desactivado = gardado sen mostrar;
              eliminado = fóra da páxina (recuperábel aquí). O público só ve os activos en{' '}
              {activeDiscipline && <Link to={activeDiscipline.path}>{activeDiscipline.label}</Link>}.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.refreshBtn} onClick={load} disabled={loading || reordering}>
              Actualizar
            </button>
            <button type="button" className={styles.primaryBtn} onClick={openCreate}>
              Novo grupo
            </button>
          </div>
        </header>

        <div className={styles.tabs}>
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`${styles.tab} ${disciplineId === d.id ? styles.tabActive : ''}`}
              onClick={() => setDisciplineId(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>

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
          <p className={styles.empty}>Non hai grupos aínda. Crea o primeiro co botón «Novo grupo».</p>
        ) : (
          <>
            {mainRows.length === 0 ? (
              <p className={styles.empty}>
                Non hai grupos activos nin ocultos. Activa «Mostrar eliminados» se borraches algún.
              </p>
            ) : (
              <div className={styles.list}>
                {mainRows.map((row, index) => renderRowCard(row, index, { deleted: false }))}
              </div>
            )}

            {showDeleted && deletedRows.length > 0 && (
              <section className={styles.deletedSection}>
                <h2 className={styles.deletedHeading}>Eliminados</h2>
                <p className={styles.deletedHint}>
                  Non aparecen na páxina pública. Restaurar devolve o estado a «Desactivado»;
                  despois podes volver a «Mostrar na páxina».
                </p>
                <div className={styles.list}>
                  {deletedRows.map((row) => renderRowCard(row, 0, { deleted: true }))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <DisciplineGroupFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        initialRow={editingRow}
        disciplineId={disciplineId}
        nextSortOrder={nextSortOrder}
        onSaved={load}
      />
    </div>
  );
};

export default DisciplineGroupsAdminPage;
