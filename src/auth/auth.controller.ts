import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthForgetDto } from './dto/auth-forget.dto';
import { AuthResetDto } from './dto/auth-reset.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from 'src/file/file.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDto) {
    const user = await this.authService.login(email, password);
    return user;
  }

  @Post('register')
  async register(@Body() { email, password, name }: AuthRegisterDTO) {
    return this.authService.register({ email, password, name });
  }

  @Post('forget')
  async forgotPassword(@Body() { email }: AuthForgetDto) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async resetPassword(@Body() { token, newPassword }: AuthResetDto) {
    return this.authService.reset(token, newPassword);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User() user) {
    return { me: 'ok', user: user };
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/png' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    // ALTERAR LÓGICA PARA SUBIR EM BUCKET, NO FUTURO
    const path = join(
      __dirname,
      '../..',
      'storage',
      'photos',
      `photo-${user.id}.png`,
    );

    try {
      this.fileService.upload(photo, path);
    } catch (e) {
      throw new BadRequestException(e);
    }

    return { sucess: true };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token é obrigatório');
    }
    return this.authService.refreshToken(refreshToken);
  }
}
