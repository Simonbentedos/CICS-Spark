import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * UploadDocumentDto — validates the metadata fields sent alongside
 * a PDF file upload (multipart/form-data).
 *
 * JSON array fields (authors, keywords) arrive as JSON strings from
 * multipart payloads and are automatically parsed by the @Transform decorator.
 */
export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  /** Accepts a JSON-serialised string array: '["Name A","Name B"]' */
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  authors: string[];

  @IsOptional()
  @IsString()
  abstract?: string;

  /** Accepts numeric strings from form-data, e.g. "2024" */
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsString()
  @IsIn(['IS', 'IT', 'CS'], { message: 'Department must be IS, IT, or CS.' })
  department: string;

  @IsString()
  @IsIn(['thesis', 'capstone'], { message: 'Type must be thesis or capstone.' })
  type: string;

  @IsOptional()
  @IsString()
  track_specialization?: string;

  @IsOptional()
  @IsString()
  adviser?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  /** Accepts a JSON-serialised string array: '["keyword1","keyword2"]' */
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsArray()
  keywords?: string[];
}
