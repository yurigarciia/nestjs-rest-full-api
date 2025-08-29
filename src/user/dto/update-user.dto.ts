import { CreateUserDTO } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UpdateUserDTO extends CreateUserDTO {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
