import { IsString, IsOptional, IsDateString, IsInt, IsEnum, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType, PriceType } from '@prisma/client';

export class CreateEventQuestionDto {
  @IsString()
  question: string;

  @IsEnum(['TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'SELECT', 'MULTIPLE_CHOICE', 'CHECKBOX'])
  type: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsString()
  @IsOptional()
  options?: string; // JSON array string

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsString()
  @IsOptional()
  onlineLink?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsOptional()
  priceAmount?: number;

  @IsString()
  @IsOptional()
  priceCurrency?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventQuestionDto)
  @IsOptional()
  questions?: CreateEventQuestionDto[];
}

