import dayjs from 'dayjs';
import { Challan } from '../types';

// Mirrors ash-website/src/components/Receipt/Receipt.jsx exactly — same static
// legal/header text, same fields substituted (challan number, truck, place, date, time).
function receiptBlock(challan: Partial<Challan> | null): string {
  const dateStr = challan?.challanDate ? dayjs(challan.challanDate).format('DD/MM/YYYY') : '';
  return `
    <div class="receipt-page">
      <div class="receipt-border">
        <div class="receipt-header">
          <div class="receipt-title">NTPC LIMITED</div>
          <div class="receipt-subtitle">(A Govt. of India Enterprises]</div>
          <div class="receipt-project">KHARGONE SUPER THERMAL POWER PROJECT</div>
          <div class="receipt-address">Post -KHEDI BUJURG, VILL-SELDA BALABAD, MP</div>
          <div class="receipt-doctype">DELIVERY CONSIGNMENT FOR ASH</div>
        </div>
        <div class="receipt-challan-no">
          <span class="label">CHALLAN NO:</span>
          <span class="value-red">${challan?.challanNumber || ''}</span>
        </div>
        <div class="receipt-line">LOA NO- CPG-1/Rate_Contract/Ash/Khargone/2025/1/V0</div>
        <div class="receipt-line">Transporter Name: <span class="bold">SONU MONU ROADLINES</span></div>
        <div class="receipt-line">Add: SANDASINGHA,SASON, SANDASINGHA,SAMBAPUR</div>
        <div class="receipt-line">ODISHA INDIA- 768003</div>
        <div class="receipt-small-line">Transporter is fully responsible for all statutory requirements, insurance,</div>
        <div class="receipt-line bold">Applicable Laws For Loading And Transportation Of Ash.</div>
        <div class="receipt-line">Issued to <span class="bold">Rudhi deshgaon NH-3478L(PKG V)NHAI</span></div>
        <div class="receipt-field">
          <span class="field-label">Place of delivery :</span>
          <span class="field-value">${challan?.placeOfDelivery || ''}</span>
        </div>
        <div class="receipt-field">
          <span class="field-label">Truck No.</span>
          <span class="field-value">${challan?.truckNumber || ''}</span>
        </div>
        <div class="receipt-field short">
          <span class="field-label">Date :</span>
          <span class="field-value">${dateStr}</span>
        </div>
        <div class="receipt-field short">
          <span class="field-label">Time :</span>
          <span class="field-value">${challan?.challanTime || ''}</span>
        </div>
        <div class="receipt-signature">
          <div>Sign &amp; Seal of</div>
          <div>Transporting agency</div>
        </div>
      </div>
    </div>
  `;
}

export function buildReceiptHtml(challan: Partial<Challan> | null, copies = 4): string {
  const blocks = Array.from({ length: copies })
    .map(() => receiptBlock(challan))
    .join('\n');
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 12px; }
          .receipt-page { width: 100%; margin-bottom: 14px; page-break-inside: avoid; }
          .receipt-border { border: 1.5px solid #000; padding: 10px 14px; }
          .receipt-header { text-align: center; margin-bottom: 6px; }
          .receipt-title { font-weight: 700; font-size: 16px; letter-spacing: 1px; }
          .receipt-subtitle { font-size: 10px; }
          .receipt-project { font-weight: 700; font-size: 12px; margin-top: 2px; }
          .receipt-address { font-size: 10px; }
          .receipt-doctype { font-weight: 700; font-size: 12px; margin-top: 4px; text-decoration: underline; }
          .receipt-challan-no { margin: 8px 0; font-size: 12px; }
          .receipt-challan-no .label { font-weight: 700; margin-right: 6px; }
          .receipt-challan-no .value-red { color: #c00; font-weight: 700; font-size: 14px; }
          .receipt-line { font-size: 11px; margin: 2px 0; }
          .receipt-small-line { font-size: 9px; margin: 2px 0; }
          .bold { font-weight: 700; }
          .receipt-field { font-size: 12px; margin: 6px 0; display: flex; }
          .receipt-field.short { display: inline-flex; width: 48%; }
          .field-label { font-weight: 700; margin-right: 6px; }
          .field-value { border-bottom: 1px solid #000; flex: 1; min-height: 14px; }
          .receipt-signature { text-align: right; font-size: 11px; margin-top: 22px; }
        </style>
      </head>
      <body>
        ${blocks}
      </body>
    </html>
  `;
}
