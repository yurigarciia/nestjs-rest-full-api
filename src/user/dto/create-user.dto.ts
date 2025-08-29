import {
  IsEmail,
  IsString,
  IsStrongPassword,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;
}
