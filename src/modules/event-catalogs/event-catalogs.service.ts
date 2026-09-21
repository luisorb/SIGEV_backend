import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { CreateEventCatalogDto, UpdateEventCatalogDto } from './dto';

const eventCatalogInclude = {
  createdBy: { select: { id: true, fullName: true } },
} as const;

export type EventCatalogWithCreatedBy = Prisma.EventCatalogGetPayload<{
  include: typeof eventCatalogInclude;
}>;

@Injectable()
export class EventCatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertUniqueName(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.eventCatalog.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Ya existe un evento con este nombre');
    }
  }

  async create(
    dto: CreateEventCatalogDto,
    user: { id: string },
  ): Promise<EventCatalogWithCreatedBy> {
    await this.assertUniqueName(dto.name);
    return this.prisma.eventCatalog.create({
      data: { name: dto.name, createdById: user.id },
      include: eventCatalogInclude,
    });
  }

  async findAll(active?: string): Promise<EventCatalogWithCreatedBy[]> {
    return this.prisma.eventCatalog.findMany({
      where: active === 'all' ? {} : { isActive: true },
      include: eventCatalogInclude,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<EventCatalogWithCreatedBy> {
    const event = await this.prisma.eventCatalog.findUnique({
      where: { id },
      include: eventCatalogInclude,
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(
    id: string,
    dto: UpdateEventCatalogDto,
  ): Promise<EventCatalogWithCreatedBy> {
    await this.findOne(id);
    if (dto.name !== undefined) {
      await this.assertUniqueName(dto.name, id);
    }
    return this.prisma.eventCatalog.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: eventCatalogInclude,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    // La inactivación conserva el registro como histórico
    await this.prisma.eventCatalog.update({
      where: { id },
      data: { isActive: false },
    });
  }
}