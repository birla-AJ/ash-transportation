import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ChallansService } from '../challans/challans.service';
import { QueryChallanDto } from '../challans/dto/query-challan.dto';
import { ChallanDocument } from '../challans/schemas/challan.schema';

const COLUMNS = [
  { header: 'Challan Number', key: 'challanNumber', width: 20 },
  { header: 'Truck Number', key: 'truckNumber', width: 18 },
  { header: 'Place Of Delivery', key: 'placeOfDelivery', width: 28 },
  { header: 'Date', key: 'date', width: 14 },
  { header: 'Time', key: 'time', width: 10 },
  { header: 'Created At', key: 'createdAt', width: 20 },
  { header: 'Updated At', key: 'updatedAt', width: 20 },
];

@Injectable()
export class ExportService {
  constructor(private readonly challansService: ChallansService) {}

  private async getRows(query: Omit<QueryChallanDto, 'page' | 'limit'>): Promise<ChallanDocument[]> {
    return this.challansService.findAllRaw(query);
  }

  async preview(query: Omit<QueryChallanDto, 'page' | 'limit'>) {
    const rows = await this.getRows(query);
    return {
      count: rows.length,
      columns: COLUMNS.map((c) => c.header),
      rows: rows.map((r) => this.toRow(r)),
    };
  }

  private toRow(r: ChallanDocument) {
    return {
      challanNumber: r.challanNumber,
      truckNumber: r.truckNumber,
      placeOfDelivery: r.placeOfDelivery,
      date: new Date(r.challanDate).toLocaleDateString('en-IN'),
      time: r.challanTime,
      createdAt: new Date(r.createdAt).toLocaleString('en-IN'),
      updatedAt: new Date(r.updatedAt).toLocaleString('en-IN'),
    };
  }

  async toCsv(query: Omit<QueryChallanDto, 'page' | 'limit'>): Promise<string> {
    const rows = await this.getRows(query);
    const header = COLUMNS.map((c) => `"${c.header}"`).join(',');
    const lines = rows.map((r) => {
      const row = this.toRow(r);
      return COLUMNS.map((c) => `"${String((row as Record<string, unknown>)[c.key] ?? '').replace(/"/g, '""')}"`).join(
        ',',
      );
    });
    return [header, ...lines].join('\n');
  }

  async toExcelBuffer(query: Omit<QueryChallanDto, 'page' | 'limit'>): Promise<ExcelJS.Buffer> {
    const rows = await this.getRows(query);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Ash Transportation Management System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Challans');
    sheet.columns = COLUMNS;
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    rows.forEach((r) => sheet.addRow(this.toRow(r)));

    return workbook.xlsx.writeBuffer();
  }

  async toPdfBuffer(query: Omit<QueryChallanDto, 'page' | 'limit'>): Promise<Buffer> {
    const rows = await this.getRows(query);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text('Ash Transportation - Challan Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#555').text(`Generated: ${new Date().toLocaleString('en-IN')}`, {
        align: 'center',
      });
      doc.moveDown(1);

      const startX = 30;
      let y = doc.y;
      const colWidths = [95, 85, 150, 70, 55, 110, 110];

      const drawRow = (values: string[], isHeader = false) => {
        let x = startX;
        doc.fontSize(8).fillColor(isHeader ? '#000' : '#222');
        values.forEach((val, i) => {
          doc.text(val, x, y, { width: colWidths[i], ellipsis: true });
          x += colWidths[i];
        });
        if (isHeader) {
          doc
            .moveTo(startX, y + 14)
            .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + 14)
            .strokeColor('#999')
            .stroke();
        }
        y += 16;
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 40;
        }
      };

      drawRow(COLUMNS.map((c) => c.header), true);
      rows.forEach((r) => {
        const row = this.toRow(r);
        drawRow(COLUMNS.map((c) => String((row as Record<string, unknown>)[c.key] ?? '')));
      });

      doc.end();
    });
  }
}
