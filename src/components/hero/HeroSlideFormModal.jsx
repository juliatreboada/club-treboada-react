// src/components/hero/HeroSlideFormModal.jsx
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildSlidePayloadFromForm,
  createSlide,
  updateSlide,
  uploadHeroImage,
} from '../../lib/heroSlidesRepository';
import styles from './HeroSlideFormModal.module.css';

const emptyForm = () => ({
  slideType: 'image',
  imageUrl: '',
  altText: '',
  linkUrl: '',
  linkExternal: false,
  icons: [
    { src: '', alt: '' },
    { src: '', alt: '' },
    { src: '', alt: '' },
  ],
});

function rowToForm(row) {
  if (!row) return emptyForm();
  if (row.slide_type === 'icons') {
    return {
      slideType: 'icons',
      imageUrl: '',
      altText: '',
      linkUrl: '',
      linkExternal: false,
      icons:
        Array.isArray(row.icons_json) && row.icons_json.length
          ? row.icons_json.map((it) => ({
              src: it?.src ?? '',
              alt: it?.alt ?? '',
            }))
          : [
              { src: '', alt: '' },
              { src: '', alt: '' },
              { src: '', alt: '' },
            ],
    };
  }
  return {
    slideType: 'image',
    imageUrl: row.image_url ?? '',
    altText: row.alt_text ?? '',
    linkUrl: row.link_url ?? '',
    linkExternal: Boolean(row.link_external),
    icons: [
      { src: '', alt: '' },
      { src: '', alt: '' },
      { src: '', alt: '' },
    ],
  };
}

const HeroSlideFormModal = ({
  open,
  onClose,
  initialRow,
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

  const updateIcon = useCallback((index, key, value) => {
    setForm((f) => {
      const icons = f.icons.map((it, i) =>
        i === index ? { ...it, [key]: value } : it
      );
      return { ...f, icons };
    });
  }, []);

  const addIcon = () => {
    setForm((f) => ({ ...f, icons: [...f.icons, { src: '', alt: '' }] }));
  };

  const removeIcon = (index) => {
    setForm((f) => ({
      ...f,
      icons: f.icons.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.slideType === 'image') {
      const hasUrl = (form.imageUrl || '').trim();
      if (!hasUrl && !file) {
        setError('Engade unha URL de imaxe ou sube un ficheiro.');
        return;
      }
    } else if (form.slideType === 'icons') {
      const hasAny = form.icons.some((it) => (it.src || '').trim());
      if (!hasAny) {
        setError('Engade polo menos unha icona cunha URL válida.');
        return;
      }
    }

    setSubmitting(true);
    try {
      let imageUrl = (form.imageUrl || '').trim();
      if (form.slideType === 'image' && file) {
        const { publicUrl, error: upErr } = await uploadHeroImage(file);
        if (upErr) {
          setError(upErr);
          setSubmitting(false);
          return;
        }
        imageUrl = publicUrl || '';
      }

      const payload = buildSlidePayloadFromForm({
        slideType: form.slideType,
        sortOrder: initialRow?.sort_order ?? nextSortOrder ?? 0,
        icons: form.icons,
        imageUrl,
        altText: form.altText,
        linkUrl: form.linkUrl,
        linkExternal: form.linkExternal,
      });

      if (initialRow?.id) {
        const { error: saveErr } = await updateSlide(initialRow.id, payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido actualizar.');
          setSubmitting(false);
          return;
        }
      } else {
        const { error: saveErr } = await createSlide(payload);
        if (saveErr) {
          setError(saveErr.message || 'Non se puido crear.');
          setSubmitting(false);
          return;
        }
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error('[hero-form]', err);
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
        aria-labelledby="hero-slide-form-title"
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
          <h2 id="hero-slide-form-title" className={styles.title}>
            {isEdit ? 'Editar slide' : 'Novo slide'}
          </h2>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <span className={styles.label}>Tipo de slide</span>
            <div className={styles.typeRow}>
              <label className={styles.typeOption}>
                <input
                  type="radio"
                  name="slide-type"
                  value="image"
                  checked={form.slideType === 'image'}
                  onChange={() => updateField('slideType', 'image')}
                />
                Imaxe
              </label>
              <label className={styles.typeOption}>
                <input
                  type="radio"
                  name="slide-type"
                  value="icons"
                  checked={form.slideType === 'icons'}
                  onChange={() => updateField('slideType', 'icons')}
                />
                Iconas (fila de imaxes pequenas)
              </label>
            </div>
          </div>

          {form.slideType === 'image' ? (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="hs-alt">
                  Texto alternativo (alt)
                </label>
                <input
                  id="hs-alt"
                  className={styles.input}
                  value={form.altText}
                  onChange={(e) => updateField('altText', e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="hs-img-url">
                  URL da imaxe (ex.: /images/…)
                </label>
                <input
                  id="hs-img-url"
                  className={styles.input}
                  value={form.imageUrl}
                  onChange={(e) => {
                    updateField('imageUrl', e.target.value);
                    setFile(null);
                  }}
                  placeholder="/images/…"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>
                  Ou subir imaxe (máx. 2 MB)
                </span>
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
                <label className={styles.label} htmlFor="hs-link">
                  Ligazón ao facer clic
                </label>
                <input
                  id="hs-link"
                  className={styles.input}
                  value={form.linkUrl}
                  onChange={(e) => updateField('linkUrl', e.target.value)}
                  placeholder="/open-acrobatica ou https://…"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.linkExternal}
                    onChange={(e) =>
                      updateField('linkExternal', e.target.checked)
                    }
                  />
                  Ligazón externa (abrir noutra pestana)
                </label>
              </div>
            </>
          ) : (
            <div className={styles.field}>
              <span className={styles.label}>Iconas da fila</span>
              <p className={styles.hint}>
                Engade unha entrada por icona. Pode haber 2-4 para que se vexan
                ben no escritorio.
              </p>
              <div className={styles.iconList}>
                {form.icons.map((icon, index) => (
                  <div key={index} className={styles.iconRow}>
                    <input
                      className={styles.input}
                      placeholder="/images/icons/…"
                      value={icon.src}
                      onChange={(e) =>
                        updateIcon(index, 'src', e.target.value)
                      }
                    />
                    <input
                      className={styles.input}
                      placeholder="alt"
                      value={icon.alt}
                      onChange={(e) =>
                        updateIcon(index, 'alt', e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() => removeIcon(index)}
                      disabled={form.icons.length <= 1}
                      aria-label="Eliminar icona"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={addIcon}
              >
                Engadir icona
              </button>
            </div>
          )}

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

export default HeroSlideFormModal;
