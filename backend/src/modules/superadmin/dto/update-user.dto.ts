import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsIn(['IS', 'IT', 'CS'], { message: 'Department must be IS, IT, or CS.' })
  department: string;
}
