// src/components/calendar/EventFormModal.jsx
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories, schools } from '../../config/calendarTaxonomy';
import {
  buildEventPayloadFromForm,
  createEvent,
  updateEvent,
  uploadEventImage,
} from '../../lib/calendarRepository';
import styles from './EventFormModal.module.css';

const emptyForm = () => ({
  title: '',
  subtitle: '',
  description: '',
  startDate: '',
  endDate: '',
  category: '',
  school: '',
  location: '',
  imageUrl: '',
  eventUrl: '',
  streamingUrl: '',
  participate: '',
});

function rowToForm(row) {
  if (!row) return emptyForm();
  return {
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    category: row.category ?? '',
    school: row.school ?? '',
    location: row.location ?? '',
    imageUrl: row.image_url ?? '',
    eventUrl: row.event_url ?? '',
    streamingUrl: row.streaming_url ?? '',
    participate: row.participate ?? '',
  };
}

const EventFormModal = ({ open, onClose, initialRow, onSaved }) => {
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
    const title = form.title.trim();
    if (!title) {
      setError('O título é obrigatorio.');
      return;
    }
    if (!form.startDate) {
      setError('A data de inicio é obrigatoria.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = form.imageUrl.trim();
      if (file) {
        const { publicUrl, error: upErr } = await uploadEventImage(file);
        if (upErr) {
          setError(upErr);
          setSubmitting(false);
          return;
        }
        imageUrl = publicUrl || '';
      }

      const payload = buildEventPayloadFromForm({
        title,
        subtitle: form.subtitle,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        category: form.category,
        school: form.school,
        location: form.location,
        imageUrl,
        eventUrl: form.eventUrl,
        streamingUrl: form.streamingUrl,
        participate: form.participate,
      });

      if (initialRow?.id) {
        const { error: saveErr } = await updateEvent(initialRow.id, payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido actualizar.');
          setSubmitting(false);
          return;
        }
      } else {
        const { error: saveErr } = await createEvent(payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido crear.');
          setSubmitting(false);
          return;
        }
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error('[calendar-form]', err);
      setError(err?.message || 'Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isEdit = Boolean(initialRow?.id);
  const displayImg =
    objectUrl ||
    (form.imageUrl && form.imageUrl.trim()
      ? form.imageUrl.trim()
      : null);

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-event-form-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Pechar"
        >
          ×
        </button>
        <div className={styles.header}>
          <h2 id="calendar-event-form-title" className={styles.title}>
            {isEdit ? 'Editar evento' : 'Novo evento'}
          </h2>
        </div>
        <form className={styles.body} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-title">
              Título *
            </label>
            <input
              id="ce-title"
              className={styles.input}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-subtitle">
              Subtítulo
            </label>
            <input
              id="ce-subtitle"
              className={styles.input}
              value={form.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              maxLength={300}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-desc">
              Descrición
            </label>
            <textarea
              id="ce-desc"
              className={styles.textarea}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ce-start">
                Data inicio *
              </label>
              <input
                id="ce-start"
                type="date"
                className={styles.input}
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ce-end">
                Data fin (opcional)
              </label>
              <input
                id="ce-end"
                type="date"
                className={styles.input}
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ce-cat">
                Modalidade
              </label>
              <select
                id="ce-cat"
                className={styles.select}
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ce-school">
                Escola
              </label>
              <select
                id="ce-school"
                className={styles.select}
                value={form.school}
                onChange={(e) => updateField('school', e.target.value)}
              >
                <option value="">—</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-loc">
              Lugar
            </label>
            <input
              id="ce-loc"
              className={styles.input}
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              maxLength={300}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-img-url">
              URL da imaxe (opcional, ex.: /images/…)
            </label>
            <input
              id="ce-img-url"
              className={styles.input}
              value={form.imageUrl}
              onChange={(e) => {
                updateField('imageUrl', e.target.value);
                setFile(null);
              }}
              placeholder="/images/events/…"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Ou subir imaxe (máx. 2 MB)</span>
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
                Seleccionado: {file.name} — substituirá a URL ao gardar.
              </p>
            )}
            {displayImg && (
              <img
                src={displayImg}
                alt=""
                className={styles.preview}
              />
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-event-url">
              Ligazón ao evento
            </label>
            <input
              id="ce-event-url"
              type="url"
              className={styles.input}
              value={form.eventUrl}
              onChange={(e) => updateField('eventUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-stream">
              Streaming
            </label>
            <input
              id="ce-stream"
              type="url"
              className={styles.input}
              value={form.streamingUrl}
              onChange={(e) => updateField('streamingUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ce-part">
              Participan do club
            </label>
            <textarea
              id="ce-part"
              className={styles.textarea}
              value={form.participate}
              onChange={(e) => updateField('participate', e.target.value)}
              rows={2}
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
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={submitting}
            >
              {submitting ? 'Gardando…' : 'Gardar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EventFormModal;
