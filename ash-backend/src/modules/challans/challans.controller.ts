import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { DeleteChallanDto } from './dto/delete-challan.dto';
import { QueryChallanDto } from './dto/query-challan.dto';
import { UpdateChallanDto } from './dto/update-challan.dto';

@ApiTags('Challans')
@ApiBearerAuth()
@Controller('challans')
export class ChallansController {
  constructor(private readonly challansService: ChallansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new challan (auto-generates number/date/time)' })
  async create(@Body() dto: CreateChallanDto, @CurrentUser('userId') userId: string) {
    return this.challansService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List challans with pagination, sorting, filtering & search' })
  async findAll(@Query() query: QueryChallanDto) {
    return this.challansService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single challan by id' })
  async findOne(@Param('id') id: string) {
    return this.challansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit truck number, place, date or time of a challan' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateChallanDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.challansService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a challan (reason required, number never reused)' })
  async remove(
    @Param('id') id: string,
    @Body() dto: DeleteChallanDto,
    @CurrentUser('userId') userId: string,
  ) {
    await this.challansService.remove(id, dto, userId);
    return { message: 'Challan deleted successfully' };
  }

  @Post(':id/print')
  @ApiOperation({ summary: 'Register a print/reprint event and return receipt data' })
  async print(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.challansService.registerPrint(id, userId);
  }
}
