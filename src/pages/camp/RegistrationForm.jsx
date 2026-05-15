// src/pages/camp/RegistrationForm.jsx
import { useMemo, useState } from 'react';
import Card from '../../components/UI/Card';
import campData from '../../data/campData';
import {
  pricePerWeekForKid,
  totalCampRegistrationAmount,
} from '../../utils/campPricing';
import { generateRefCode } from '../../utils/refCode';
import styles from './RegistrationForm.module.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const emptyKid = () => ({
  firstName: '',
  lastName: '',
  birthDate: '',
  weeks: [],
  isClubMember: false,
  allergies: '',
  notes: '',
});

const initialState = {
  parentFirstName: '',
  parentLastName: '',
  parentEmail: '',
  parentPhone: '',
  emergencyName: '',
  emergencyPhone: '',
  notes: '',
  acceptTerms: false,
  kids: [emptyKid()],
};

const RegistrationForm = ({ onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const totalWeekSlots = useMemo(
    () => form.kids.reduce((sum, kid) => sum + kid.weeks.length, 0),
    [form.kids]
  );

  const total = useMemo(
    () => totalCampRegistrationAmount(form.kids, campData),
    [form.kids]
  );

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const setKidField = (index, name, value) => {
    setForm((prev) => {
      const kids = prev.kids.map((kid, i) =>
        i === index ? { ...kid, [name]: value } : kid
      );
      return { ...prev, kids };
    });
    const key = `kids.${index}.${name}`;
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleKidWeek = (index, weekId) => {
    setForm((prev) => {
      const kids = prev.kids.map((kid, i) => {
        if (i !== index) return kid;
        const has = kid.weeks.includes(weekId);
        const weeks = has
          ? kid.weeks.filter((w) => w !== weekId)
          : [...kid.weeks, weekId];
        return { ...kid, weeks };
      });
      return { ...prev, kids };
    });
    const key = `kids.${index}.weeks`;
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addKid = () => {
    setForm((prev) => ({ ...prev, kids: [...prev.kids, emptyKid()] }));
  };

  const removeKid = (index) => {
    setForm((prev) => {
      if (prev.kids.length === 1) return prev;
      return { ...prev, kids: prev.kids.filter((_, i) => i !== index) };
    });
  };

  const validate = () => {
    const next = {};
    if (!form.parentFirstName.trim()) next.parentFirstName = 'Indica o nome';
    if (!form.parentLastName.trim()) next.parentLastName = 'Indica os apelidos';

    const email = form.parentEmail.trim();
    if (!email) {
      next.parentEmail = 'Indica o email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.parentEmail = 'Email non válido';
    }

    if (!form.parentPhone.trim()) {
      next.parentPhone = 'Indica o teléfono';
    }

    if (!form.acceptTerms) {
      next.acceptTerms = 'Debes aceptar a información do campamento';
    }

    form.kids.forEach((kid, index) => {
      if (!kid.firstName.trim()) {
        next[`kids.${index}.firstName`] = 'Indica o nome';
      }
      if (!kid.lastName.trim()) {
        next[`kids.${index}.lastName`] = 'Indica os apelidos';
      }
      if (!kid.birthDate) {
        next[`kids.${index}.birthDate`] = 'Indica a data de nacemento';
      } else {
        const date = new Date(kid.birthDate);
        const today = new Date();
        if (Number.isNaN(date.getTime()) || date > today) {
          next[`kids.${index}.birthDate`] = 'Data non válida';
        }
      }
      if (kid.weeks.length === 0) {
        next[`kids.${index}.weeks`] = 'Selecciona polo menos unha semana';
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const refCode = generateRefCode();
      const totalAmount = totalCampRegistrationAmount(form.kids, campData);

      const payload = {
        ref_code: refCode,
        parent_first_name: form.parentFirstName.trim(),
        parent_last_name: form.parentLastName.trim(),
        parent_email: form.parentEmail.trim(),
        parent_phone: form.parentPhone.trim(),
        emergency_contact_name: form.emergencyName.trim(),
        emergency_contact_phone: form.emergencyPhone.trim(),
        notes: form.notes.trim(),
        total_amount: totalAmount,
        kids: form.kids.map((kid) => ({
          first_name: kid.firstName.trim(),
          last_name: kid.lastName.trim(),
          birth_date: kid.birthDate,
          weeks: kid.weeks,
          is_club_member: Boolean(kid.isClubMember),
          allergies: kid.allergies.trim(),
          notes: kid.notes.trim(),
        })),
      };

      console.info('[camp] Submitting registration', {
        refCode,
        payload,
        hasUrl: Boolean(SUPABASE_URL),
        hasKey: Boolean(SUPABASE_KEY),
      });

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error(
          'A configuración de Supabase non está dispoñible. Revisa o .env.local e reinicia o servidor.'
        );
      }

      const url = `${SUPABASE_URL}/rest/v1/rpc/create_camp_registration`;
      console.info('[camp] POST', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ payload }),
      });

      const text = await response.text();
      let result = null;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        // Server returned non-JSON; we'll surface the raw text below.
      }

      console.info('[camp] RPC response', {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (!response.ok) {
        const detail =
          result?.message ||
          result?.error ||
          result?.hint ||
          text ||
          `HTTP ${response.status}`;
        throw new Error(detail);
      }

      if (!result?.registration) {
        throw new Error('A resposta do servidor non contén a inscrición.');
      }

      onSuccess?.({
        registration: result.registration,
        kids: result.kids || [],
      });
    } catch (error) {
      console.error('[camp] Failed to submit registration', error);
      const detail = error?.message || error?.error_description || '';
      setSubmitError(
        detail
          ? `Non puidemos gardar a inscrición: ${detail}`
          : 'Houbo un problema ao enviar a inscrición. Por favor, inténtao de novo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card hoverEffect={false} className={styles.formCard}>
      <header className={styles.formHeader}>
        <h2>Inscrición</h2>
        <p>
          Completa os datos do pai/nai/titor e engade tantos nenos como queiras
          inscribir. Recibirás un código que terás que usar no concepto da
          transferencia bancaria.
        </p>
      </header>

      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.fieldset}>
          <h3 className={styles.fieldsetTitle}>Datos do pai/nai/titor</h3>

          <div className={styles.row}>
            <Field
              label="Nome"
              required
              error={errors.parentFirstName}
            >
              <input
                type="text"
                value={form.parentFirstName}
                onChange={(e) => setField('parentFirstName', e.target.value)}
                autoComplete="given-name"
              />
            </Field>
            <Field
              label="Apelidos"
              required
              error={errors.parentLastName}
            >
              <input
                type="text"
                value={form.parentLastName}
                onChange={(e) => setField('parentLastName', e.target.value)}
                autoComplete="family-name"
              />
            </Field>
          </div>

          <div className={styles.row}>
            <Field label="Email" required error={errors.parentEmail}>
              <input
                type="email"
                value={form.parentEmail}
                onChange={(e) => setField('parentEmail', e.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label="Teléfono" required error={errors.parentPhone}>
              <input
                type="tel"
                value={form.parentPhone}
                onChange={(e) => setField('parentPhone', e.target.value)}
                autoComplete="tel"
                placeholder="+34 600 000 000"
              />
            </Field>
          </div>

          <div className={styles.row}>
            <Field label="Contacto de emerxencia (nome)" optional>
              <input
                type="text"
                value={form.emergencyName}
                onChange={(e) => setField('emergencyName', e.target.value)}
              />
            </Field>
            <Field label="Contacto de emerxencia (teléfono)" optional>
              <input
                type="tel"
                value={form.emergencyPhone}
                onChange={(e) => setField('emergencyPhone', e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className={styles.fieldset}>
          <div className={styles.kidsHeader}>
            <h3 className={styles.fieldsetTitle}>
              Nenos/as a inscribir ({form.kids.length})
            </h3>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={addKid}
            >
              + Engadir outro neno/a
            </button>
          </div>

          {form.kids.map((kid, index) => (
            <KidBlock
              key={index}
              index={index}
              kid={kid}
              campWeeks={campData.weeks}
              errors={errors}
              onChange={(name, value) => setKidField(index, name, value)}
              onToggleWeek={(weekId) => toggleKidWeek(index, weekId)}
              onRemove={form.kids.length > 1 ? () => removeKid(index) : null}
            />
          ))}
        </section>

        <section className={styles.fieldset}>
          <h3 className={styles.fieldsetTitle}>Comentarios (opcional)</h3>
          <Field
            label="Información adicional que queiras compartir"
            optional
            hideLabel
          >
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Información médica, intolerancias, etc."
            />
          </Field>
        </section>

        <section className={styles.summary}>
          <div>
            <span className={styles.summaryLabel}>Total a transferir</span>
            <span className={styles.summaryAmount}>
              {total.toFixed(2)} {campData.currency}
            </span>
          </div>
          {totalWeekSlots > 0 ? (
            <ul className={styles.summaryLines}>
              {form.kids.map((kid, i) => {
                const w = kid.weeks.length;
                if (!w) return null;
                const unit = pricePerWeekForKid(kid.isClubMember, campData);
                const sub = w * unit;
                const name =
                  kid.firstName.trim() ||
                  `Neno/a #${i + 1}`;
                return (
                  <li key={i}>
                    <span className={styles.summaryLineName}>{name}</span>
                    <span className={styles.summaryLineDetail}>
                      {w} {w === 1 ? 'semana' : 'semanas'} × {unit}
                      {campData.currency} (
                      {kid.isClubMember ? 'socio/a' : 'xeral'}) ={' '}
                      <strong>
                        {sub.toFixed(2)} {campData.currency}
                      </strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.summaryHint}>
              Selecciona as semanas para cada neno/a para ver o desglose.
            </p>
          )}
        </section>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(e) => setField('acceptTerms', e.target.checked)}
          />
          <span>
            Lin a información do campamento e acepto que a inscrición só queda
            confirmada tras recibir o ingreso bancario.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className={styles.errorMessage}>{errors.acceptTerms}</p>
        )}

        {submitError && (
          <div className={styles.submitError}>{submitError}</div>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Enviar inscrición'}
          </button>
        </div>
      </form>
    </Card>
  );
};

const Field = ({ label, children, error, required, optional, hideLabel }) => (
  <label className={styles.field}>
    <span className={hideLabel ? styles.visuallyHidden : styles.fieldLabel}>
      {label}
      {required && <span className={styles.requiredMark}> *</span>}
      {optional && <span className={styles.optionalMark}> (opcional)</span>}
    </span>
    {children}
    {error && <span className={styles.errorMessage}>{error}</span>}
  </label>
);

const KidBlock = ({
  index,
  kid,
  campWeeks,
  errors,
  onChange,
  onToggleWeek,
  onRemove,
}) => {
  const weeksError = errors[`kids.${index}.weeks`];
  return (
    <div className={styles.kidBlock}>
      <div className={styles.kidBlockHeader}>
        <span className={styles.kidNumber}>Neno/a #{index + 1}</span>
        {onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
          >
            Eliminar
          </button>
        )}
      </div>

      <div className={styles.row}>
        <Field
          label="Nome"
          required
          error={errors[`kids.${index}.firstName`]}
        >
          <input
            type="text"
            value={kid.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
        </Field>
        <Field
          label="Apelidos"
          required
          error={errors[`kids.${index}.lastName`]}
        >
          <input
            type="text"
            value={kid.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Data de nacemento"
        required
        error={errors[`kids.${index}.birthDate`]}
      >
        <input
          type="date"
          value={kid.birthDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => onChange('birthDate', e.target.value)}
        />
      </Field>

      <div
        className={`${styles.weeksGroup} ${
          weeksError ? styles.weeksGroupError : ''
        }`}
      >
        <span className={styles.fieldLabel}>
          Semanas
          <span className={styles.requiredMark}> *</span>
        </span>
        <p className={styles.weeksHint}>
          Podes elixir unha semana ou as dúas.
        </p>
        <div className={styles.weeksOptions}>
          {campWeeks.map((week) => {
            const checked = kid.weeks.includes(week.id);
            return (
              <label
                key={week.id}
                className={`${styles.weekOption} ${
                  checked ? styles.weekOptionChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleWeek(week.id)}
                />
                <span className={styles.weekOptionContent}>
                  <span className={styles.weekOptionTitle}>{week.label}</span>
                  <span className={styles.weekOptionDates}>{week.shortDates}</span>
                </span>
              </label>
            );
          })}
        </div>
        {weeksError && (
          <span className={styles.errorMessage}>{weeksError}</span>
        )}
      </div>

      <label className={styles.memberCheckboxRow}>
        <input
          type="checkbox"
          checked={Boolean(kid.isClubMember)}
          onChange={(e) => onChange('isClubMember', e.target.checked)}
        />
        <span>
          É socia ou socio do Club Treboada (tarifa reducida:{' '}
          {campData.priceMemberPerKidPerWeek}
          {campData.currency}/semana; xeral: {campData.pricePerKidPerWeek}
          {campData.currency}/semana).
        </span>
      </label>

      <Field label="Alerxias ou condicións médicas" optional>
        <input
          type="text"
          value={kid.allergies}
          onChange={(e) => onChange('allergies', e.target.value)}
          placeholder="Ningunha, intolerancia á lactosa, asma…"
        />
      </Field>

      <Field label="Notas adicionais" optional>
        <input
          type="text"
          value={kid.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Información que debamos saber"
        />
      </Field>
    </div>
  );
};

export default RegistrationForm;
