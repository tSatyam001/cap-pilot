import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Stakeholder } from '@/contexts/CapTableContext';
import { formatNumber, formatPercent, formatCompact } from '@/lib/format';

export function exportCapTablePdf(
  stakeholders: Stakeholder[],
  totalShares: number,
  getOwnership: (shares: number) => number,
  currency: '$' | '₹'
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString();

  doc.setFontSize(18);
  doc.text('CapPilot – Cap Table Report', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated on ${now}`, 14, 27);
  doc.setTextColor(0);

  doc.setFontSize(11);
  doc.text(`Total Shares: ${formatNumber(totalShares)}`, 14, 38);

  autoTable(doc, {
    startY: 44,
    head: [['Name', 'Role', 'Share Class', 'Shares', 'Ownership %']],
    body: stakeholders.map(s => [
      s.name,
      s.role,
      s.shareClass,
      formatNumber(s.shares),
      formatPercent(getOwnership(s.shares)),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  doc.save('cap-table-report.pdf');
}

export function exportFundingRoundPdf(
  stakeholders: Stakeholder[],
  params: {
    preMoney: number;
    investment: number;
    postMoney: number;
    pricePerShare: number;
    newShares: number;
    investorNewPct: number;
    currency: '$' | '₹';
  },
  comparison: Array<{ name: string; role: string; shares: number; oldPct: number; newPct: number; dilution: number }>
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString();
  const c = params.currency;

  doc.setFontSize(18);
  doc.text('CapPilot – Funding Round Report', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated on ${now}`, 14, 27);
  doc.setTextColor(0);

  doc.setFontSize(11);
  const summary = [
    `Pre-Money Valuation: ${formatCompact(params.preMoney, c)}`,
    `Investment Amount: ${formatCompact(params.investment, c)}`,
    `Post-Money Valuation: ${formatCompact(params.postMoney, c)}`,
    `Price per Share: ${c}${params.pricePerShare.toFixed(2)}`,
    `New Shares Issued: ${formatNumber(params.newShares)}`,
    `New Investor Ownership: ${formatPercent(params.investorNewPct)}`,
  ];
  summary.forEach((line, i) => doc.text(line, 14, 38 + i * 6));

  const rows = [
    ...comparison.map(s => [
      s.name,
      s.role,
      formatNumber(s.shares),
      formatPercent(s.oldPct),
      formatPercent(s.newPct),
      `-${formatPercent(s.dilution)}`,
    ]),
    ['New Investor', 'Investor', formatNumber(params.newShares), '—', formatPercent(params.investorNewPct), '—'],
  ];

  autoTable(doc, {
    startY: 38 + summary.length * 6 + 6,
    head: [['Stakeholder', 'Role', 'Shares', 'Before %', 'After %', 'Dilution %']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  doc.save('funding-round-report.pdf');
}
