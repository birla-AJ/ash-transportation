# Printing Guide — Ash Transportation Management System

The single most important feature in this system is that every receipt
printed matches your existing NTPC Khargone consignment challan exactly —
same header, border, spacing, and labels, with only Challan Number, Truck
Number, Place Of Delivery, Date and Time filled in automatically.

There are two different ways this system can print, because there are two
different kinds of printers people use for this — pick the one that matches
your actual hardware.

---

## Which printer type do you have?

| | **Regular printer (laser/inkjet/dot-matrix)** | **Thermal ESC/POS printer** |
|---|---|---|
| What it looks like | A normal office/desktop printer | A small receipt printer with a paper roll, no ink cartridge |
| Paper | Cut A5/A4 sheets (like your current challan pad) | Continuous thermal roll, usually 58mm or 80mm wide |
| Used by | The **website** (via the browser's print dialog) | The **mobile app** (via USB-OTG cable) |
| Layout | Full bordered box, blue/red colors, exact pixel match | Plain text, no border/colors (thermal printers can't render those) |

If you're not sure: if what you print on today looks like the card in your
reference photo (a bound, perforated pad), you almost certainly want the
**regular printer** path via the website. Thermal ESC/POS printers are for
a different physical format (long paper rolls) and would need a redesigned
layout, not a scaled-down version of this card.

---

## A) Website printing (regular printer) — recommended for your setup

This is what `ReceiptPrintView.jsx` + `Receipt.jsx` do.

### One-time setup

1. Connect your printer to the computer running the website (USB cable, or
   install its Windows/Mac driver as normal — no special driver is needed
   for this app, it prints through the browser like any web page).
2. Load A5 paper (or your challan pad, aligned in the tray/feeder the way
   your printer expects for pre-printed stock).
3. Open your browser's print settings once and set:
   - **Paper size:** A5
   - **Margins:** None / Minimum
   - **Scale:** 100% (not "Fit to page")
   - **Headers and footers:** Off
   Most browsers remember these settings for this site afterward.

### Printing a challan

1. **Add Challan → Save & Print**, or **Reports → Reprint** on any row.
2. The app opens a full-screen preview showing 4 identical receipts
   (one per printed page) and calls the print API to log the event.
3. Click **Print 4 Copies** — your browser's print dialog opens with all 4
   pages already queued. Click Print once; all 4 come out without repeating
   the dialog.
4. If a copy jams or misprints, just click **Print 4 Copies** again from
   the same screen (or use **Reprint** from Reports later) — every reprint
   is logged in Audit Logs, and the challan number never changes.

### Calibration

If the printed content sits slightly off the pre-printed pad's lines:

- Most printer driver dialogs have an "offset" or "position adjustment"
  setting — nudge X/Y there rather than editing the app.
- If you're printing onto blank A5 paper (not a pre-printed pad), no
  calibration is needed — the app draws its own border and labels.
- For persistent offsets specific to one printer, the backend's `Settings`
  module stores a `printerCalibration` object (`{ marginTop, marginLeft }`
  in mm) for future use if you want the frontend to apply a print-time
  offset — ask and I can wire this into the CSS.

### Fast printing tips

- Keep the browser tab open on the Reports or Add Challan page during a
  busy shift — repeated prints reuse the same warmed-up print pipeline.
- Printing 4 pages in one job (as this app does) is faster and more
  reliable than clicking "print" 4 separate times, and avoids the driver
  dialog reappearing each time.

---

## B) Mobile app printing (USB ESC/POS thermal printer)

This is what `src/components/receiptPrinter.js` in the mobile app does,
using `react-native-thermal-receipt-printer`.

### One-time setup

1. Connect the thermal printer to the Android device with a USB-OTG cable
   (most rugged/industrial Android handhelds support this; a regular phone
   needs an OTG adapter).
2. Open the app → **Profile** tab → **Scan** — connected USB printers
   appear in a list.
3. Tap the printer to connect. It stays connected until the app restarts or
   the cable is unplugged.

### Printing a challan

- **Add Challan → Save & Print**, or **Reports → Reprint** on any card —
  sends 4 copies to the connected printer automatically.
- If printing fails (printer unplugged, out of paper, wrong device
  selected), the app shows an error and the challan is still saved — you
  can reprint later from Reports once the printer is reconnected.

### Calibration

- Paper width: set correctly in **Settings → Printer Width (mm)** on the
  website (58mm or 80mm) — this affects line wrapping in the ESC/POS text.
- Most ESC/POS printers have a physical density/darkness dial or a setting
  in their own companion app — that's hardware-level and outside what this
  software controls.

### Reprint & speed

- Every print (first print or reprint) calls `POST /challans/:id/print`,
  which increments `printCount` and timestamps `lastPrintedAt` — visible in
  Reports and Audit Logs, so you always know how many times a challan was
  printed and when.
- ESC/POS printing is sequential (4 print jobs sent one after another);
  on typical thermal printers this takes 2-4 seconds total.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Website: extra blank page prints after the 4 receipts | Browser adding its own header/footer | Turn off headers/footers in print settings |
| Website: content shifted / cut off | Paper size not set to A5, or scale not 100% | Fix in browser print dialog (see setup above) |
| Website: colors print as black/grey | Printer set to grayscale/draft mode | Switch to color mode in the printer driver, or accept black — border/labels remain identical either way |
| Mobile: "No printers found" | OTG cable not connected, or printer off | Check cable/power, tap Scan again |
| Mobile: text runs off the edge of the paper | Printer width mismatch | Set the correct width in Settings on the website |
| Either: challan number looks wrong after a reprint | It isn't — reprints never regenerate the number | Check Audit Logs for the full print history on that challan |
