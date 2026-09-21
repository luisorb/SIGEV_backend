import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EventCatalogsService } from './event-catalogs.service';
import { CreateEventCatalogDto, UpdateEventCatalogDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { UserWithRoles } from '../../database/types';
import { ROLES } from '../../config/constants';

@ApiTags('Catálogo de eventos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('event-catalogs')
export class EventCatalogsController {
  constructor(private readonly eventCatalogsService: EventCatalogsService) {}

  @Post()
  @Roles(ROLES.OPERATOR, ROLES.SOLICITANTE, ROLES.FUNCTIONAL_ADMIN)
  @ApiOperation({ summary: 'Crear evento del catálogo (Operador, Solicitante o Functional Admin)' })
  create(@Body() dto: CreateEventCatalogDto, @CurrentUser() user: UserWithRoles) {
    return this.eventCatalogsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos del catálogo (activos por defecto; use active=all para todos)' })
  findAll(@Query('active') active?: string) {
    return this.eventCatalogsService.findAll(active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener evento del catálogo por ID' })
  findOne(@Param('id') id: string) {
    return this.eventCatalogsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.OPERATOR)
  @ApiOperation({ summary: 'Actualizar evento del catálogo (solo Operador)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventCatalogDto) {
    return this.eventCatalogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(ROLES.OPERATOR)
  @ApiOperation({ summary: 'Inactivar evento del catálogo (solo Operador)' })
  remove(@Param('id') id: string) {
    return this.eventCatalogsService.remove(id);
  }
}