import { IsJWT, IsStrongPassword } from 'class-validator';

export class AuthResetDto {
  @IsJWT()
  token: string;

  @IsStrongPassword({
    minLength: 6,
    minUppercase: 0,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  newPassword: string;
}
