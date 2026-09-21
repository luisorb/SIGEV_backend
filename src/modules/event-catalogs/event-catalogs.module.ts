import { Module } from '@nestjs/common';
import { EventCatalogsController } from './event-catalogs.controller';
import { EventCatalogsService } from './event-catalogs.service';

@Module({
  controllers: [EventCatalogsController],
  providers: [EventCatalogsService],
  exports: [EventCatalogsService],
})
export class EventCatalogsModule {}