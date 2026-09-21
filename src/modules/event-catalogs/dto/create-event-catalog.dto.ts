import {
  IsString, MinLength, MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const normalizeName = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  return value.replace(/\s+/g, ' ').trim();
};

export class CreateEventCatalogDto {
  @ApiProperty({ example: 'MESA DE TRABAJO' })
  @Transform(normalizeName)
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;
}