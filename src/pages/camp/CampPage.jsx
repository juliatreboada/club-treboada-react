// src/pages/camp/CampPage.jsx
import { useState } from 'react';
import Card from '../../components/UI/Card';
import campData from '../../data/campData';
import RegistrationForm from './RegistrationForm';
import SuccessScreen from './SuccessScreen';
import styles from './CampPage.module.css';

const CampPage = () => {
  const [submission, setSubmission] = useState(null);

  const {
    title,
    edition,
    subtitle,
    weeks,
    ageRange,
    schedule,
    location,
    pricePerKidPerWeek,
    priceMemberPerKidPerWeek,
    currency,
    registrationDeadline,
    minRegistrations,
    includes,
    toBring,
    dailySchedule,
    bankInfo,
    importantNotes,
    registrationSteps,
  } = campData;

  return (
    <div className={styles.campPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.edition}>Verán {edition}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.heroWeeksGrid}>
            {weeks.map((week) => (
              <div key={week.id} className={styles.heroWeekCard}>
                <span className={styles.heroWeekBadge}>{week.label}</span>
                <span className={styles.heroWeekDates}>{week.shortDates}</span>
                <span className={styles.heroWeekSubdates}>{week.dates}</span>
              </div>
            ))}
          </div>

          <div className={styles.heroActions}>
            <a href="#inscripcion" className={styles.heroPrimaryCta}>
              Inscribirse agora
            </a>
            <span className={styles.heroPrice}>
              desde <strong>{priceMemberPerKidPerWeek}{currency}</strong> / semana
              (socias/os) · <strong>{pricePerKidPerWeek}{currency}</strong> / semana
              (xeral)
            </span>
          </div>

          <div className={styles.heroFacts}>
            <div className={styles.heroFact}>
              <span className={styles.heroFactLabel}>Idade</span>
              <span className={styles.heroFactValue}>{ageRange}</span>
            </div>
            <div className={styles.heroFact}>
              <span className={styles.heroFactLabel}>Horario</span>
              <span className={styles.heroFactValue}>{schedule}</span>
            </div>
            <div className={styles.heroFact}>
              <span className={styles.heroFactLabel}>Localización</span>
              <span className={styles.heroFactValue}>{location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deadline banner */}
      {registrationDeadline && (
        <section className={styles.deadlineBanner}>
          <div className="container">
            <div className={styles.deadlineInner}>
              <span className={styles.deadlineLabel}>Prazo</span>
              <span className={styles.deadlineText}>
                Aberta ata o <strong>{registrationDeadline}</strong>.
              </span>
              {minRegistrations && (
                <span className={styles.deadlinePill}>
                  Mínimo {minRegistrations} inscricións por semana
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Info grid */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.infoGrid}>
            <Card hoverEffect className={styles.infoCard}>
              <h3>Que inclúe?</h3>
              <ul>
                {includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card hoverEffect className={styles.infoCard}>
              <h3>Que traer?</h3>
              <ul>
                {toBring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card hoverEffect className={styles.infoCard}>
              <h3>Horario tipo</h3>
              <ul className={styles.scheduleList}>
                {dailySchedule.map((slot) => (
                  <li key={slot.time}>
                    <span className={styles.scheduleTime}>{slot.time}</span>
                    <span className={styles.scheduleActivity}>{slot.activity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Bank info */}
      <section className={styles.section}>
        <div className="container">
          <Card hoverEffect={false} className={styles.bankCard}>
            <h3>Datos para o ingreso</h3>
            <p className={styles.bankIntro}>
              Realiza unha transferencia bancaria coa cantidade total e usa o teu
              código de inscrición no concepto.
            </p>
            <dl className={styles.bankList}>
              <div>
                <dt>Titular</dt>
                <dd>{bankInfo.accountHolder}</dd>
              </div>
              <div>
                <dt>IBAN</dt>
                <dd>{bankInfo.iban}</dd>
              </div>
              {bankInfo.bic && (
                <div>
                  <dt>BIC</dt>
                  <dd>{bankInfo.bic}</dd>
                </div>
              )}
              {bankInfo.bank && (
                <div>
                  <dt>Banco</dt>
                  <dd>{bankInfo.bank}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </section>

      {/* Important notes */}
      {importantNotes.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Card hoverEffect={false} className={styles.notesCard}>
              <h3>Información importante</h3>
              <ul>
                {importantNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      )}

      {/* How registration works */}
      {registrationSteps?.length > 0 && (
        <section
          id="pasos-inscricion"
          className={`${styles.section} ${styles.stepsSection}`}
        >
          <div className="container">
            <Card hoverEffect={false} className={styles.stepsCard}>
              <h2 className={styles.stepsHeading}>Como facer a inscrición</h2>
              <p className={styles.stepsIntro}>
                Segue estes pasos na orde indicada. Se tes dúbidas, contacta co
                club antes de enviar o formulario.
              </p>
              <ul className={styles.stepsList} role="list">
                {registrationSteps.map((item, index) => (
                  <li key={index} className={styles.stepItem}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <div className={styles.stepBody}>
                      <h3 className={styles.stepTitle}>{item.title}</h3>
                      {item.body && (
                        <p className={styles.stepText}>{item.body}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <p className={styles.stepsFootnote}>
                Os datos bancarios para o ingreso están na sección anterior. Lembra
                incluír o código no concepto.
              </p>
            </Card>
          </div>
        </section>
      )}

      {/* Registration form or success screen (same slot) */}
      <section id="inscripcion" className={styles.section}>
        <div className="container">
          {submission ? (
            <SuccessScreen
              registration={submission.registration}
              kids={submission.kids}
              onReset={() => setSubmission(null)}
            />
          ) : (
            <RegistrationForm onSuccess={setSubmission} />
          )}
        </div>
      </section>
    </div>
  );
};

export default CampPage;
