import { IsString, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RSVPAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export class CreateRSVPDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @IsBoolean()
  @IsOptional()
  consentGiven?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RSVPAnswerDto)
  @IsOptional()
  answers?: RSVPAnswerDto[];
}

