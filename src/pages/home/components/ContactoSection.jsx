// src/pages/HomePage/components/ContactSection.jsx
import SectionTitle from '../../../components/UI/SectionTitle';
import Section from '../../../components/UI/Section';
import contactData from '../../../data/contactData';
import styles from './ContactoSection.module.css';

const ContactInfoItem = ({ icon, title, children }) => {
  return (
    <div className={styles.infoItem}>
      <i className={`${icon} ${styles.icon}`}></i>
      <div className={styles.content}>
        <h4>{title}</h4>
        {children}
      </div>
    </div>
  );
};

const ContactoSection = () => {
  return (
    <Section id="contacto" background="light">
      <SectionTitle 
        title="Contacto"
        align="center"
      />

      <div className={styles.grid}>
        {/* Left Column - Contact Info */}
        <div className={styles.infoColumn}>
          {/* Address */}
          <ContactInfoItem icon={contactData.address.icon} title={contactData.address.title}>
            <ul className={styles.addressList}>
              {contactData.address.lines.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </ContactInfoItem>

          {/* Email */}
          <ContactInfoItem icon={contactData.email.icon} title={contactData.email.title}>
            <a href={`mailto:${contactData.email.email}`} className={styles.emailLink}>
              {contactData.email.email}
            </a>
          </ContactInfoItem>

          {/* Phone & WhatsApp combined row */}
          <div className={styles.contactRow}>
            {/* Phone */}
            <ContactInfoItem icon={contactData.phone.icon} title={contactData.phone.title}>
              <ul className={styles.contactList}>
                {contactData.phone.contacts.map((contact, index) => (
                  <li key={index}>
                    <a href={`tel:${contact.number.replace(/\s/g, '')}`} className={styles.phoneLink}>
                      <span className={styles.contactName}>{contact.name}:</span>{' '}
                      <span className={styles.contactNumber}>{contact.number}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </ContactInfoItem>

            {/* WhatsApp */}
            <ContactInfoItem icon={contactData.whatsapp.icon} title={contactData.whatsapp.title}>
              <ul className={styles.contactList}>
                {contactData.whatsapp.contacts.map((contact, index) => (
                  <li key={index}>
                    <a 
                      href={`https://wa.me/${contact.number.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappLink}
                    >
                      <span className={styles.contactName}>{contact.name}:</span>{' '}
                      <span className={styles.contactNumber}>{contact.number}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </ContactInfoItem>
          </div>
        </div>

        {/* Right Column - Map */}
        <div className={styles.mapColumn}>
          <div className={styles.mapContainer}>
            <iframe
              src={contactData.map.src}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={contactData.map.title}
              className={styles.map}
            ></iframe>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ContactoSection;