import React from 'react';
import './receipt.css';

/**
 * Renders one copy of the Ash delivery challan, matching the physical
 * pre-printed NTPC Khargone consignment pad exactly:
 * - All static header/legal text and labels are fixed, never editable.
 * - Only challanNumber, truckNumber, placeOfDelivery, date and time change.
 */
export default function Receipt({ challan }) {
  const dateStr = challan?.challanDate
    ? new Date(challan.challanDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <div className="receipt-page">
      <div className="receipt-border">
        <div className="receipt-header">
          <div className="receipt-title">NTPC LIMITED</div>
          <div className="receipt-subtitle">(A Govt. of India Enterprises]</div>
          <div className="receipt-project">KHARGONE SUPER THERMAL POWER PROJECT</div>
          <div className="receipt-address">Post -KHEDI BUJURG, VILL-SELDA BALABAD, MP</div>
          <div className="receipt-doctype">DELIVERY CONSIGNMENT FOR ASH</div>
        </div>

        <div className="receipt-challan-no">
          <span className="label">CHALLAN NO:</span>
          <span className="value-red">{challan?.challanNumber || ''}</span>
        </div>

        <div className="receipt-line">LOA NO- CPG-1/Rate_Contract/Ash/Khargone/2025/1/V0</div>

        <div className="receipt-line">
          Transporter Name: <span className="bold">SONU MONU ROADLINES</span>
        </div>
        <div className="receipt-line">Add: SANDASINGHA,SASON, SANDASINGHA,SAMBAPUR</div>
        <div className="receipt-line">ODISHA INDIA- 768003</div>

        <div className="receipt-small-line">
          Transporter is fully responsible for all statutory requirements, insurance,
        </div>
        <div className="receipt-line bold">Applicable Laws For Loading And Transportation Of Ash.</div>
        <div className="receipt-line">
          Issued to <span className="bold">Rudhi deshgaon NH-3478L(PKG V)NHAI</span>
        </div>

        <div className="receipt-field">
          <span className="field-label">Place of delivery :</span>
          <span className="field-value">{challan?.placeOfDelivery || ''}</span>
        </div>
        <div className="receipt-field">
          <span className="field-label">Truck No.</span>
          <span className="field-value">{challan?.truckNumber || ''}</span>
        </div>
        <div className="receipt-field short">
          <span className="field-label">Date :</span>
          <span className="field-value">{dateStr}</span>
        </div>
        <div className="receipt-field short">
          <span className="field-label">Time :</span>
          <span className="field-value">{challan?.challanTime || ''}</span>
        </div>

        <div className="receipt-signature">
          <div>Sign &amp; Seal of</div>
          <div>Transporting agency</div>
        </div>
      </div>
    </div>
  );
}
