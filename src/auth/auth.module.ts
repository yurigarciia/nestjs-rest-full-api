import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { FileModule } from 'src/file/file.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { BearerToken } from 'src/user/entity/user-tokens.entity';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '7d' },
    }),
    FileModule,
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([PasswordResetToken]),
    TypeOrmModule.forFeature([BearerToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
