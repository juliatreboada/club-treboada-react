// src/utils/generateReceiptPdf.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { pricePerWeekForKid } from './campPricing';

const RED = [188, 5, 0];
const DARK = [40, 40, 40];
const GREY = [120, 120, 120];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-ES') : '';

const formatMoney = (value, currency = '\u20AC') =>
  `${Number(value).toFixed(2)} ${currency}`;

const WEEK_SHORT = { week1: 'S1', week2: 'S2' };

const formatWeeks = (weekIds = []) => {
  if (!Array.isArray(weekIds) || weekIds.length === 0) return '-';
  // Stable order: week1 before week2
  return weekIds
    .slice()
    .sort()
    .map((id) => WEEK_SHORT[id] || id)
    .join(' + ');
};

/**
 * Build the parent's receipt PDF.
 * @param {object} params
 * @param {object} params.registration - DB row that we just inserted
 * @param {Array}  params.kids - kids attached to the registration
 * @param {object} params.camp - data from campData.js
 * @returns {jsPDF} the document. Call `.save('filename.pdf')` to download.
 */
export const generateReceiptPdf = ({ registration, kids, camp }) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let cursorY = margin;

  // Header band
  doc.setFillColor(...RED);
  doc.rect(0, 0, pageWidth, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Club Treboada', margin, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${camp.title} ${camp.edition}`, margin, 60);
  doc.text(camp.dates, margin, 76);

  cursorY = 120;

  // Title
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Resgardo de inscrición', margin, cursorY);
  cursorY += 8;

  // Ref code box (prominent because it doubles as bank transfer reference)
  const boxY = cursorY + 8;
  const boxHeight = 60;
  doc.setFillColor(255, 247, 247);
  doc.setDrawColor(...RED);
  doc.setLineWidth(1);
  doc.roundedRect(margin, boxY, pageWidth - margin * 2, boxHeight, 6, 6, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(...RED);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DE INSCRICIÓN', margin + 16, boxY + 20);

  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text(registration.ref_code, margin + 16, boxY + 44);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  const noteText =
    'Indica este código no concepto da transferencia bancaria.';
  doc.text(noteText, pageWidth - margin - 16, boxY + 44, { align: 'right' });

  cursorY = boxY + boxHeight + 28;

  // Parent block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('Datos do pai/nai/titor', margin, cursorY);
  cursorY += 6;
  doc.setDrawColor(...RED);
  doc.setLineWidth(1.5);
  doc.line(margin, cursorY, margin + 40, cursorY);
  cursorY += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...DARK);

  const parentRows = [
    ['Nome', `${registration.parent_first_name} ${registration.parent_last_name}`],
    ['Email', registration.parent_email],
    ['Teléfono', registration.parent_phone],
  ];

  if (registration.emergency_contact_name || registration.emergency_contact_phone) {
    parentRows.push([
      'Contacto emerxencia',
      [registration.emergency_contact_name, registration.emergency_contact_phone]
        .filter(Boolean)
        .join(' \u2022 '),
    ]);
  }

  parentRows.forEach(([label, value]) => {
    doc.setTextColor(...GREY);
    doc.text(label, margin, cursorY);
    doc.setTextColor(...DARK);
    doc.text(String(value || ''), margin + 130, cursorY);
    cursorY += 16;
  });

  cursorY += 8;

  // Kids table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(`Nenos/as inscritos (${kids.length})`, margin, cursorY);
  cursorY += 6;
  doc.setDrawColor(...RED);
  doc.line(margin, cursorY, margin + 40, cursorY);
  cursorY += 12;

  autoTable(doc, {
    startY: cursorY,
    head: [
      [
        'Nome',
        'Apelidos',
        'Data nac.',
        'Semanas',
        'Tarifa',
        'Importe',
        'Alerxias / notas',
      ],
    ],
    body: kids.map((kid) => {
      const weeksCount = Array.isArray(kid.weeks) ? kid.weeks.length : 0;
      const unit = pricePerWeekForKid(Boolean(kid.is_club_member), camp);
      const subtotal = weeksCount * unit;
      const tariffLabel = kid.is_club_member
        ? `Socio/a (${camp.priceMemberPerKidPerWeek} EUR/sem)`
        : `Xeral (${camp.pricePerKidPerWeek} EUR/sem)`;
      return [
        kid.first_name || '',
        kid.last_name || '',
        formatDate(kid.birth_date),
        formatWeeks(kid.weeks),
        tariffLabel,
        formatMoney(subtotal, camp.currency),
        [kid.allergies, kid.notes].filter(Boolean).join(' / ') || '-',
      ];
    }),
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, textColor: DARK },
    headStyles: { fillColor: RED, textColor: 255, halign: 'left' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 52 },
      2: { cellWidth: 48 },
      3: { cellWidth: 32 },
      4: { cellWidth: 100 },
      5: { cellWidth: 48, halign: 'right' },
      6: { cellWidth: 78 },
    },
  });

  cursorY = doc.lastAutoTable.finalY + 24;

  // Notes (if any)
  if (registration.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Notas / observacións', margin, cursorY);
    cursorY += 14;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    const wrapped = doc.splitTextToSize(registration.notes, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 14 + 10;
  }

  // Total & bank info
  if (cursorY > 670) {
    doc.addPage();
    cursorY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('Pago por transferencia bancaria', margin, cursorY);
  cursorY += 6;
  doc.setDrawColor(...RED);
  doc.line(margin, cursorY, margin + 40, cursorY);
  cursorY += 18;

  const totalText = `Total: ${formatMoney(registration.total_amount, camp.currency)}`;
  doc.setFontSize(14);
  doc.text(totalText, margin, cursorY);
  cursorY += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const bankRows = [
    ['Titular', camp.bankInfo.accountHolder],
    ['IBAN', camp.bankInfo.iban],
  ];
  if (camp.bankInfo.bic) bankRows.push(['BIC', camp.bankInfo.bic]);
  if (camp.bankInfo.bank) bankRows.push(['Banco', camp.bankInfo.bank]);
  bankRows.push(['Concepto', registration.ref_code]);

  bankRows.forEach(([label, value]) => {
    doc.setTextColor(...GREY);
    doc.text(label, margin, cursorY);
    doc.setTextColor(...DARK);
    doc.text(String(value || ''), margin + 130, cursorY);
    cursorY += 16;
  });

  cursorY += 8;

  // Important notes from camp data
  if (camp.importantNotes?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text('Información importante', margin, cursorY);
    cursorY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    camp.importantNotes.forEach((note) => {
      const wrapped = doc.splitTextToSize(`\u2022 ${note}`, pageWidth - margin * 2);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 13;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(
    `Resgardo emitido o ${new Date().toLocaleString('es-ES')}`,
    margin,
    footerY
  );
  doc.text('Club Treboada', pageWidth - margin, footerY, { align: 'right' });

  return doc;
};

export const downloadReceiptPdf = (args) => {
  const doc = generateReceiptPdf(args);
  doc.save(`resgardo-${args.registration.ref_code}.pdf`);
};
