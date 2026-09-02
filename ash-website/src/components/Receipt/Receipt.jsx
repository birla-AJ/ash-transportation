import React from 'react';
import './receipt.css';

/**
 * Renders one copy of the Ash delivery challan, matching the physical
 * pre-printed NTPC Khargone consignment pad exactly:
 * - All static header/legal text and labels are fixed, never editable.
 * - Transporter name/address come from the transporter selected on the
 *   challan (managed by Sub Admins, picked by Admins in Add Challan).
 * - The signature shown is whichever admin created this challan's own
 *   signature image (set by their Sub Admin) — not a hardcoded email map.
 */
export default function Receipt({ challan }) {
  const signatureSrc = challan?.createdByUser?.signatureImage || undefined;

  const dateStr = challan?.challanDate
    ? new Date(challan.challanDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  // Derive the printed time from createdAt (same source Dashboard/Reports
  // use) instead of the stored challanTime string — challanTime was being
  // written in the server's system timezone (UTC) instead of IST, so old
  // records still carry a wrong value. createdAt is a real timestamp and
  // always renders correctly in the browser's local (IST) timezone.
  const timeStr = challan?.createdAt
    ? new Date(challan.createdAt).toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : challan?.challanTime || '';

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
          Transporter Name: <span className="bold">{challan?.transporter?.name || ''}</span>
        </div>
        <div className="receipt-line">Add: {challan?.transporter?.address || ''}</div>

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
          <span className="field-value">{timeStr}</span>
        </div>

        <div className="receipt-signature">
          {signatureSrc && (
            <img className="receipt-signature-img" src={signatureSrc} alt="Signature" />
          )}
          <div>Sign &amp; Seal of</div>
          <div>Transporting agency</div>
        </div>
      </div>
    </div>
  );
}
