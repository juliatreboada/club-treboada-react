// src/pages/camp/SuccessScreen.jsx
import { useEffect, useState } from 'react';
import Card from '../../components/UI/Card';
import campData from '../../data/campData';
import { pricePerWeekForKid } from '../../utils/campPricing';
import { downloadReceiptPdf } from '../../utils/generateReceiptPdf';
import styles from './SuccessScreen.module.css';

const weeksLabel = (weekIds = []) => {
  if (!weekIds.length) return '—';
  return campData.weeks
    .filter((w) => weekIds.includes(w.id))
    .map((w) => w.label)
    .join(', ');
};

const SuccessScreen = ({ registration, kids, onReset }) => {
  const [copied, setCopied] = useState(false);

  const totalWeekSlots = kids.reduce(
    (sum, kid) => sum + (kid.weeks?.length || 0),
    0
  );

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(id);
  }, [copied]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(registration.ref_code);
      setCopied(true);
    } catch {
      // Clipboard might be unavailable (older browsers, http, etc.) — ignore.
    }
  };

  const handleDownload = () => {
    downloadReceiptPdf({ registration, kids, camp: campData });
  };

  return (
    <Card hoverEffect={false} className={styles.successCard}>
      <div className={styles.successIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="42" height="42">
          <path
            d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
            fill="currentColor"
          />
        </svg>
      </div>

      <h2 className={styles.title}>Inscrición recibida!</h2>
      <p className={styles.intro}>
        Gardamos os datos correctamente. Para confirmar a praza, realiza a
        transferencia bancaria <strong>indicando o seguinte código no concepto</strong>.
      </p>

      <div className={styles.refBlock}>
        <span className={styles.refLabel}>Código de inscrición</span>
        <div className={styles.refRow}>
          <code className={styles.refCode}>{registration.ref_code}</code>
          <button
            type="button"
            className={styles.copyButton}
            onClick={copyRef}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailsBlock}>
          <h3>Resumo</h3>
          <dl className={styles.detailsList}>
            <div>
              <dt>Pai/nai/titor</dt>
              <dd>
                {registration.parent_first_name} {registration.parent_last_name}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{registration.parent_email}</dd>
            </div>
            <div>
              <dt>Inscricións ({kids.length})</dt>
              <dd>
                <ul className={styles.kidsList}>
                  {kids.map((kid) => {
                    const w = kid.weeks?.length || 0;
                    const unit = pricePerWeekForKid(
                      Boolean(kid.is_club_member),
                      campData
                    );
                    const lineTotal = w * unit;
                    return (
                    <li key={kid.id}>
                      <span>
                        {kid.first_name} {kid.last_name}
                        {kid.is_club_member ? (
                          <span className={styles.memberBadge}> Socio/a</span>
                        ) : null}
                      </span>
                      <span className={styles.kidWeeks}>
                        {weeksLabel(kid.weeks)}
                        {w > 0 ? (
                          <span className={styles.kidAmount}>
                            {' '}
                            · {w} × {unit}
                            {campData.currency} = {lineTotal.toFixed(2)}
                            {campData.currency}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                  })}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Total semanas reservadas</dt>
              <dd>{totalWeekSlots}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd className={styles.totalAmount}>
                {Number(registration.total_amount).toFixed(2)} {campData.currency}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.detailsBlock}>
          <h3>Datos para o ingreso</h3>
          <dl className={styles.detailsList}>
            <div>
              <dt>Titular</dt>
              <dd>{campData.bankInfo.accountHolder}</dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd className={styles.iban}>{campData.bankInfo.iban}</dd>
            </div>
            {campData.bankInfo.bic && (
              <div>
                <dt>BIC</dt>
                <dd>{campData.bankInfo.bic}</dd>
              </div>
            )}
            <div>
              <dt>Concepto</dt>
              <dd className={styles.concept}>{registration.ref_code}</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className={styles.emailNote}>
        Tamén enviarémosche unha confirmación a <strong>{registration.parent_email}</strong>{' '}
        unha vez verifiquemos o ingreso.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleDownload}
        >
          Descargar resgardo (PDF)
        </button>
        {onReset && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onReset}
          >
            Inscribir outra familia
          </button>
        )}
      </div>
    </Card>
  );
};

export default SuccessScreen;
