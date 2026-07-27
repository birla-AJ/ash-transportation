import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QueryChallanDto } from '../challans/dto/query-challan.dto';
import { ExportService } from './export.service';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('preview')
  @ApiOperation({ summary: 'Preview export data (rows + columns) before download' })
  async preview(@Query() query: QueryChallanDto) {
    return this.exportService.preview(query);
  }

  @Get('csv')
  @ApiOperation({ summary: 'Download challans as CSV' })
  async exportCsv(@Query() query: QueryChallanDto, @Res() res: Response) {
    const csv = await this.exportService.toCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="challans-${Date.now()}.csv"`);
    res.send(csv);
  }

  @Get('excel')
  @ApiOperation({ summary: 'Download challans as Excel (.xlsx)' })
  async exportExcel(@Query() query: QueryChallanDto, @Res() res: Response) {
    const buffer = await this.exportService.toExcelBuffer(query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="challans-${Date.now()}.xlsx"`);
    res.send(buffer);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Download challans as PDF' })
  async exportPdf(@Query() query: QueryChallanDto, @Res() res: Response) {
    const buffer = await this.exportService.toPdfBuffer(query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="challans-${Date.now()}.pdf"`);
    res.send(buffer);
  }
}
