// src/pages/admin/RegistrationsPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import campData from '../../data/campData';
import {
  getCampRegistrationSettings,
  setCampRegistrationOpenState,
} from '../../lib/campRegistrationSettings';
import { calculateAge } from '../../utils/calculateAge';
import styles from './RegistrationsPage.module.css';

const STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

const PAYMENT_LABELS = {
  pending: 'Pendente',
  paid: 'Pagado',
};

const WEEK_LABELS = Object.fromEntries(
  campData.weeks.map((w) => [w.id, w.label])
);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-ES') : '—';

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const formatMoney = (value) =>
  `${Number(value || 0).toFixed(2)} ${campData.currency}`;

const computeWeekStats = (registrations) => {
  const active = registrations.filter((r) => r.status !== 'cancelled');

  return campData.weeks.map((week) => {
    let kids = 0;
    let registrationCount = 0;

    for (const reg of active) {
      let hasWeek = false;
      for (const kid of reg.kids || []) {
        if ((kid.weeks || []).includes(week.id)) {
          kids += 1;
          hasWeek = true;
        }
      }
      if (hasWeek) registrationCount += 1;
    }

    return {
      id: week.id,
      label: week.label,
      shortDates: week.shortDates,
      kids,
      registrations: registrationCount,
      minRequired: campData.minRegistrations,
    };
  });
};

const RegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [viewerRole, setViewerRole] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from('registrations')
      .select('*, kids:registration_kids(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin] Failed to load registrations', error);
      setFetchError(error.message || 'Non se puideron cargar as inscricións.');
      setRegistrations([]);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);

    const [{ data: settingsData, error: settingsError }, roleResult] =
      await Promise.all([
        getCampRegistrationSettings(),
        supabase.auth.getUser(),
      ]);

    if (settingsError) {
      setActionError(
        settingsError.message || 'Non se puido cargar o estado das inscricións.'
      );
    } else if (settingsData) {
      setRegistrationsOpen(settingsData.registrationsOpen);
    }

    const userId = roleResult.data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      setViewerRole(profile?.role ?? null);
    }

    setSettingsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return registrations.filter((reg) => {
      if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && reg.payment_status !== paymentFilter) {
        return false;
      }
      if (weekFilter !== 'all') {
        const someKidHasWeek = (reg.kids || []).some((kid) =>
          (kid.weeks || []).includes(weekFilter)
        );
        if (!someKidHasWeek) return false;
      }
      if (term) {
        const haystack = [
          reg.ref_code,
          reg.parent_first_name,
          reg.parent_last_name,
          reg.parent_email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [registrations, statusFilter, paymentFilter, weekFilter, search]);

  const stats = useMemo(() => {
    const totalRegistrations = registrations.length;
    const totalKids = registrations.reduce(
      (sum, r) => sum + (r.kids?.length || 0),
      0
    );
    const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
    const collected = registrations
      .filter((r) => r.payment_status === 'paid')
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const pending = registrations
      .filter(
        (r) => r.payment_status === 'pending' && r.status !== 'cancelled'
      )
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    return { totalRegistrations, totalKids, confirmed, collected, pending };
  }, [registrations]);

  const weekStats = useMemo(
    () => computeWeekStats(registrations),
    [registrations]
  );

  const handleStatusChange = async (registration, newStatus) => {
    setUpdatingId(registration.id);
    setActionError(null);
    const previous = registration.status;

    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registration.id ? { ...r, status: newStatus } : r
      )
    );

    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', registration.id);

    if (error) {
      console.error('[admin] Failed to update status', error);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, status: previous } : r
        )
      );
      setActionError(error.message || 'Non se puido actualizar o estado.');
    }
    setUpdatingId(null);
  };

  const handlePaymentChange = async (registration, newPayment) => {
    setUpdatingId(registration.id);
    setActionError(null);
    const previous = registration.payment_status;

    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registration.id ? { ...r, payment_status: newPayment } : r
      )
    );

    const { error } = await supabase
      .from('registrations')
      .update({ payment_status: newPayment })
      .eq('id', registration.id);

    if (error) {
      console.error('[admin] Failed to update payment', error);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, payment_status: previous } : r
        )
      );
      setActionError(error.message || 'Non se puido actualizar o pago.');
    }
    setUpdatingId(null);
  };

  const canManageRegistrationState = viewerRole === 'admin';

  const handleRegistrationStateToggle = async () => {
    if (!canManageRegistrationState) return;

    const nextState = !registrationsOpen;
    setSettingsSaving(true);
    setActionError(null);

    const { data, error } = await setCampRegistrationOpenState(nextState);

    if (error) {
      console.error('[admin] Failed to update camp registration state', error);
      setActionError(
        error.message || 'Non se puido cambiar o estado das inscricións.'
      );
    } else if (data) {
      setRegistrationsOpen(data.registrationsOpen);
    }

    setSettingsSaving(false);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Inscricións campamento</h1>
            <p className={styles.subtitle}>
              Xestiona as inscricións do campamento de verán.
            </p>
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={fetchRegistrations}
            disabled={loading}
          >
            {loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </header>

        <div className={styles.stats}>
          <StatPill label="Inscricións" value={stats.totalRegistrations} />
          <StatPill label="Nenos/as" value={stats.totalKids} />
          <StatPill label="Confirmadas" value={stats.confirmed} />
          <StatPill label="Recaudado" value={formatMoney(stats.collected)} />
          <StatPill label="Pendente cobro" value={formatMoney(stats.pending)} />
        </div>

        <section className={styles.registrationStateCard}>
          <div>
            <h2 className={styles.registrationStateTitle}>
              Estado das inscricións
            </h2>
            <p className={styles.registrationStateText}>
              Agora mesmo están{' '}
              <strong>{registrationsOpen ? 'abertas' : 'pechadas'}</strong> para
              novas solicitudes.
            </p>
            {!canManageRegistrationState && !settingsLoading && (
              <p className={styles.registrationStateHint}>
                Só as persoas con rol de admin poden cambiar este estado.
              </p>
            )}
          </div>
          <button
            type="button"
            className={`${styles.stateButton} ${
              registrationsOpen ? styles.stateButtonClose : styles.stateButtonOpen
            }`}
            onClick={handleRegistrationStateToggle}
            disabled={
              settingsLoading || settingsSaving || !canManageRegistrationState
            }
          >
            {settingsLoading
              ? 'Cargando…'
              : settingsSaving
                ? 'Gardando…'
                : registrationsOpen
                  ? 'Pechar inscricións'
                  : 'Abrir inscricións'}
          </button>
        </section>

        <section className={styles.weekStats} aria-label="Inscricións por semana">
          <h2 className={styles.weekStatsTitle}>Por semana</h2>
          <p className={styles.weekStatsHint}>
            Nenos/as por semana (inscricións non canceladas). Mínimo para
            celebrar o campamento: {campData.minRegistrations}.
          </p>
          <div className={styles.weekStatsGrid}>
            {weekStats.map((week) => (
              <WeekStatCard key={week.id} week={week} />
            ))}
          </div>
        </section>

        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            <FilterChips
              label="Estado"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { id: 'all', label: 'Todas' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'confirmed', label: 'Confirmadas' },
                { id: 'cancelled', label: 'Canceladas' },
              ]}
            />
            <FilterChips
              label="Pago"
              value={paymentFilter}
              onChange={setPaymentFilter}
              options={[
                { id: 'all', label: 'Todos' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'paid', label: 'Pagados' },
              ]}
            />
            <FilterChips
              label="Semana"
              value={weekFilter}
              onChange={setWeekFilter}
              options={[
                { id: 'all', label: 'Todas' },
                ...campData.weeks.map((w) => {
                  const count =
                    weekStats.find((s) => s.id === w.id)?.kids ?? 0;
                  return {
                    id: w.id,
                    label: `${w.label} (${count})`,
                  };
                }),
              ]}
            />
          </div>
          <input
            type="search"
            className={styles.search}
            placeholder="Buscar por código, nome ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {actionError && (
          <div className={styles.errorBanner}>{actionError}</div>
        )}
        {fetchError && (
          <div className={styles.errorBanner}>{fetchError}</div>
        )}

        {loading ? (
          <div className={styles.placeholder}>Cargando inscricións…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.placeholder}>
            {registrations.length === 0
              ? 'Aínda non hai inscricións.'
              : 'Ningunha inscrición coincide cos filtros.'}
          </div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                updating={updatingId === reg.id}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const StatPill = ({ label, value }) => (
  <div className={styles.statPill}>
    <span className={styles.statLabel}>{label}</span>
    <span className={styles.statValue}>{value}</span>
  </div>
);

const WeekStatCard = ({ week }) => {
  const meetsMinimum = week.kids >= week.minRequired;
  const remaining = Math.max(week.minRequired - week.kids, 0);

  return (
    <div
      className={`${styles.weekStatCard} ${
        meetsMinimum ? styles.weekStatCardOk : styles.weekStatCardPending
      }`}
    >
      <div className={styles.weekStatHeader}>
        <span className={styles.weekStatLabel}>{week.label}</span>
        <span className={styles.weekStatDates}>{week.shortDates}</span>
      </div>
      <div className={styles.weekStatKids}>
        <span className={styles.weekStatKidsValue}>{week.kids}</span>
        <span className={styles.weekStatKidsUnit}>
          {week.kids === 1 ? 'neno/a' : 'nenos/as'}
        </span>
      </div>
      <p className={styles.weekStatRegistrations}>
        {week.registrations}{' '}
        {week.registrations === 1 ? 'inscrición' : 'inscricións'}
      </p>
      <p className={styles.weekStatMinimum}>
        {meetsMinimum
          ? `Mínimo alcanzado (${week.minRequired})`
          : `Faltan ${remaining} para o mínimo (${week.minRequired})`}
      </p>
    </div>
  );
};

const FilterChips = ({ label, value, onChange, options }) => (
  <div className={styles.filter}>
    <span className={styles.filterLabel}>{label}</span>
    <div className={styles.chipRow}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`${styles.chip} ${
            value === opt.id ? styles.chipActive : ''
          }`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const StatusBadge = ({ kind, value }) => (
  <span
    className={`${styles.badge} ${
      styles[`badge_${kind}_${value}`] || ''
    }`}
  >
    {kind === 'status' ? STATUS_LABELS[value] : PAYMENT_LABELS[value]}
  </span>
);

const RegistrationCard = ({
  registration,
  updating,
  onStatusChange,
  onPaymentChange,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(registration.ref_code);
      setCopied(true);
    } catch {
      // ignore
    }
  };

  return (
    <li className={`${styles.card} ${updating ? styles.cardUpdating : ''}`}>
      <header className={styles.cardHeader}>
        <div className={styles.refBlock}>
          <code className={styles.refCode}>{registration.ref_code}</code>
          <button
            type="button"
            className={styles.copyButton}
            onClick={copyRef}
            aria-label="Copiar código"
          >
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.metaPrimary}>
            {registration.parent_first_name} {registration.parent_last_name}
          </span>
          <span className={styles.metaSecondary}>
            {formatDateTime(registration.created_at)}
          </span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.amount}>
            {formatMoney(registration.total_amount)}
          </span>
          <div className={styles.badgeRow}>
            <StatusBadge kind="status" value={registration.status} />
            <StatusBadge kind="payment" value={registration.payment_status} />
          </div>
        </div>
      </header>

      <section className={styles.contact}>
        <div>
          <span className={styles.contactLabel}>Email</span>
          <a href={`mailto:${registration.parent_email}`}>
            {registration.parent_email}
          </a>
        </div>
        <div>
          <span className={styles.contactLabel}>Teléfono</span>
          <a href={`tel:${registration.parent_phone}`}>
            {registration.parent_phone}
          </a>
        </div>
        {(registration.emergency_contact_name ||
          registration.emergency_contact_phone) && (
          <div>
            <span className={styles.contactLabel}>Emerxencia</span>
            <span>
              {[
                registration.emergency_contact_name,
                registration.emergency_contact_phone,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
        )}
      </section>

      <section className={styles.kidsSection}>
        <h3 className={styles.kidsTitle}>
          Nenos/as ({registration.kids?.length || 0})
        </h3>
        <ul className={styles.kidsList}>
          {(registration.kids || []).map((kid) => {
            const age = calculateAge(kid.birth_date);
            return (
              <li key={kid.id} className={styles.kidRow}>
                <div className={styles.kidMain}>
                  <span className={styles.kidName}>
                    {kid.first_name} {kid.last_name}
                  </span>
                  <span className={styles.kidMeta}>
                    {age != null ? `${age} anos · ` : ''}
                    {formatDate(kid.birth_date)}
                  </span>
                </div>
                <div className={styles.kidWeeks}>
                  {(kid.weeks || []).map((w) => (
                    <span key={w} className={styles.weekChip}>
                      {WEEK_LABELS[w] || w}
                    </span>
                  ))}
                  {kid.is_club_member && (
                    <span className={styles.memberChip}>Socio/a</span>
                  )}
                </div>
                {(kid.allergies || kid.notes) && (
                  <div className={styles.kidNotes}>
                    {[kid.allergies, kid.notes].filter(Boolean).join(' · ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {registration.notes && (
          <p className={styles.registrationNotes}>
            <strong>Notas:</strong> {registration.notes}
          </p>
        )}
      </section>

      <footer className={styles.actions}>
        <div className={styles.actionGroup}>
          <span className={styles.actionLabel}>Estado</span>
          {['pending', 'confirmed', 'cancelled'].map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.actionButton} ${
                registration.status === s ? styles.actionButtonActive : ''
              }`}
              disabled={updating || registration.status === s}
              onClick={() => onStatusChange(registration, s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className={styles.actionGroup}>
          <span className={styles.actionLabel}>Pago</span>
          {['pending', 'paid'].map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.actionButton} ${
                registration.payment_status === p
                  ? styles.actionButtonActive
                  : ''
              }`}
              disabled={updating || registration.payment_status === p}
              onClick={() => onPaymentChange(registration, p)}
            >
              {PAYMENT_LABELS[p]}
            </button>
          ))}
        </div>
      </footer>
    </li>
  );
};

export default RegistrationsPage;
