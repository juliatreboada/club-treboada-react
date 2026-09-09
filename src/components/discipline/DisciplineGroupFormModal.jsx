// src/components/discipline/DisciplineGroupFormModal.jsx
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildGroupPayloadFromForm,
  createGroup,
  updateGroup,
  uploadDisciplineImage,
} from '../../lib/disciplineGroupsRepository';
import styles from './DisciplineGroupFormModal.module.css';

const emptyForm = () => ({
  groupKey: '',
  name: '',
  age: '',
  days: '',
  hours: '',
  pavilion: '',
  priceActivity: '',
  priceLicense: '',
  contact: '',
  extraNotes: '',
  photoUrl: '',
});

function rowToForm(row) {
  if (!row) return emptyForm();
  return {
    groupKey: row.group_key ?? '',
    name: row.name ?? '',
    age: row.age ?? '',
    days: row.days ?? '',
    hours: row.hours ?? '',
    pavilion: row.pavilion ?? '',
    priceActivity: row.price_activity ?? '',
    priceLicense: row.price_license ?? '',
    contact: row.contact ?? '',
    extraNotes: row.extra_notes ?? '',
    photoUrl: row.photo_url ?? '',
  };
}

const slugify = (value) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const DisciplineGroupFormModal = ({
  open,
  onClose,
  initialRow,
  disciplineId,
  nextSortOrder,
  onSaved,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(rowToForm(initialRow));
    setFile(null);
    setObjectUrl(null);
    setError(null);
  }, [open, initialRow]);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const updateField = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Engade un nome para o grupo.');
      return;
    }
    const groupKey = form.groupKey.trim() || slugify(form.name);
    if (!groupKey) {
      setError('Non se puido xerar un identificador para o grupo.');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = (form.photoUrl || '').trim();
      if (file) {
        const { publicUrl, error: upErr } = await uploadDisciplineImage(file);
        if (upErr) {
          setError(upErr);
          setSubmitting(false);
          return;
        }
        photoUrl = publicUrl || '';
      }

      const payload = buildGroupPayloadFromForm({
        disciplineId,
        groupKey,
        sortOrder: initialRow?.sort_order ?? nextSortOrder ?? 0,
        name: form.name,
        age: form.age,
        days: form.days,
        hours: form.hours,
        pavilion: form.pavilion,
        priceActivity: form.priceActivity,
        priceLicense: form.priceLicense,
        contact: form.contact,
        extraNotes: form.extraNotes,
        photoUrl,
      });

      if (initialRow?.id) {
        const { error: saveErr } = await updateGroup(initialRow.id, payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido actualizar.');
          setSubmitting(false);
          return;
        }
      } else {
        const { error: saveErr } = await createGroup(payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido crear.');
          setSubmitting(false);
          return;
        }
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error('[discipline-group-form]', err);
      setError(err?.message || 'Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isEdit = Boolean(initialRow?.id);
  const displayImg =
    objectUrl || (form.photoUrl && form.photoUrl.trim() ? form.photoUrl.trim() : null);

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discipline-group-form-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Pechar">
          ×
        </button>
        <div className={styles.header}>
          <h2 id="discipline-group-form-title" className={styles.title}>
            {isEdit ? 'Editar grupo' : 'Novo grupo'}
          </h2>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dg-name">
              Nome do grupo
            </label>
            <input
              id="dg-name"
              className={styles.input}
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Foto de portada (máx. 2 MB)</span>
            <label className={styles.dropZone}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              Arrastra ou fai clic para escoller ficheiro
            </label>
            {file && (
              <p className={styles.hint}>
                Seleccionado: {file.name} — substituirá a foto actual ao gardar.
              </p>
            )}
            {displayImg && <img src={displayImg} alt="" className={styles.preview} />}
            <input
              className={styles.input}
              value={form.photoUrl}
              onChange={(e) => {
                updateField('photoUrl', e.target.value);
                setFile(null);
              }}
              placeholder="ou pega unha URL de imaxe (/images/…)"
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dg-age">
                Idade
              </label>
              <input
                id="dg-age"
                className={styles.input}
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="mínimo 6 anos"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dg-days">
                Días
              </label>
              <input
                id="dg-days"
                className={styles.input}
                value={form.days}
                onChange={(e) => updateField('days', e.target.value)}
                placeholder="Martes e Xoves"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dg-hours">
              Horario
            </label>
            <input
              id="dg-hours"
              className={styles.input}
              value={form.hours}
              onChange={(e) => updateField('hours', e.target.value)}
              placeholder="17:30 - 18:30"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dg-pavilion">
              Pavillón / Ubicación
            </label>
            <input
              id="dg-pavilion"
              className={styles.input}
              value={form.pavilion}
              onChange={(e) => updateField('pavilion', e.target.value)}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dg-price-activity">
                Precio Actividade
              </label>
              <input
                id="dg-price-activity"
                className={styles.input}
                value={form.priceActivity}
                onChange={(e) => updateField('priceActivity', e.target.value)}
                placeholder="42€/mes"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dg-price-license">
                Precio Licencia
              </label>
              <input
                id="dg-price-license"
                className={styles.input}
                value={form.priceLicense}
                onChange={(e) => updateField('priceLicense', e.target.value)}
                placeholder="30€/ano"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dg-contact">
              Contacto
            </label>
            <input
              id="dg-contact"
              className={styles.input}
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="Nome 600 00 00 00"
            />
            <p className={styles.hint}>
              Se hai máis dun nome/número, o botón de chamada non aparecerá (para
              evitar unha ligazón telefónica ambigua).
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dg-notes">
              Notas adicionais
            </label>
            <textarea
              id="dg-notes"
              className={styles.textarea}
              value={form.extraNotes}
              onChange={(e) => updateField('extraNotes', e.target.value)}
              rows={2}
              placeholder="Calquera información que non encaixe nos campos anteriores"
            />
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Gardando…' : 'Gardar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DisciplineGroupFormModal;
