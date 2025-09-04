import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from 'src/user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './entity/password-reset-token.entity';
import { BearerToken } from 'src/user/entity/user-tokens.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(BearerToken)
    private readonly bearerTokenRepository: Repository<BearerToken>,
  ) {}

  async createToken(
    user: UserEntity,
    reuseRefreshToken?: string,
    reuseRefreshExpiresAt?: Date,
  ) {
    await this.bearerTokenRepository.update(
      { userId: user.id, active: true },
      { active: false },
    );

    // Access token
    const payload = { id: user.id, name: user.name, email: user.email };
    const accessExpiresIn = 60 * 60 * 24 * 7; // 7 dias
    // const accessExpiresIn = 60; // 60 segundos para teste de refresh token
    const expiresAt = new Date(Date.now() + accessExpiresIn * 1000);

    const options = {
      expiresIn: `${accessExpiresIn}s`,
      subject: user.id.toString(),
      issuer: 'app-backend-login',
      audience: 'app-users',
      secret: String(process.env.JWT_SECRET),
    };

    const token = this.jwtService.sign(payload, options);

    // Refresh token
    let refreshToken: string;
    let refreshExpiresAt: Date;
    if (reuseRefreshToken && reuseRefreshExpiresAt) {
      refreshToken = reuseRefreshToken;
      refreshExpiresAt = reuseRefreshExpiresAt;
    } else {
      refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshExpiresIn = 60 * 60 * 24 * 30; // 30 dias
      refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
    }

    await this.bearerTokenRepository.save({
      token,
      refreshToken,
      userId: user.id,
      active: true,
      expiresAt,
      refreshExpiresAt,
    });

    return {
      accessToken: token,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: Math.floor(
        (refreshExpiresAt.getTime() - Date.now()) / 1000,
      ),
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const tokenEntity = await this.bearerTokenRepository.findOne({
      where: { refreshToken: oldRefreshToken },
      order: { id: 'DESC' },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (
      tokenEntity.active &&
      tokenEntity.refreshExpiresAt &&
      tokenEntity.refreshExpiresAt > new Date()
    ) {
      const user = await this.userRepository.findOne({
        where: { id: tokenEntity.userId },
      });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      tokenEntity.active = false;
      await this.bearerTokenRepository.save(tokenEntity);

      return this.createToken(
        user,
        tokenEntity.refreshToken,
        tokenEntity.refreshExpiresAt,
      );
    }

    const lastToken = await this.bearerTokenRepository.findOne({
      where: { userId: tokenEntity.userId },
      order: { id: 'DESC' },
    });

    if (
      lastToken &&
      lastToken.refreshToken === oldRefreshToken &&
      lastToken.refreshExpiresAt &&
      lastToken.refreshExpiresAt < new Date()
    ) {
      const user = await this.userRepository.findOne({
        where: { id: tokenEntity.userId },
      });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      lastToken.active = false;
      await this.bearerTokenRepository.save(lastToken);

      return this.createToken(user);
    }

    throw new UnauthorizedException('Refresh token expirado ou já utilizado');
  }

  async checkToken(token: string) {
    const tokenEntity = await this.bearerTokenRepository.findOne({
      where: { token, active: true },
    });
    if (!tokenEntity) {
      throw new UnauthorizedException('Token inválido ou inativo');
    }

    const now = new Date();
    if (
      tokenEntity.expiresAt instanceof Date &&
      now instanceof Date &&
      tokenEntity.expiresAt.getTime() <= now.getTime()
    ) {
      throw new UnauthorizedException('Token expirado');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: String(process.env.JWT_SECRET),
      });
      return decoded;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      ...(await this.createToken(user)),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register({ email, password, name }: AuthRegisterDTO) {
    const user = await this.userRepository.save({
      email,
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
      name,
    });
    return {
      ...(await this.createToken(user)),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async forget(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '1h',
        subject: user.id.toString(),
        issuer: 'forget',
        audience: 'app-users',
        secret: String(process.env.JWT_SECRET),
      },
    );

    await this.tokenRepository.save({
      token,
      userId: user.id,
      used: false,
      usedAt: null,
    });

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha',
      template: 'forget',
      context: {
        userName: user.name,
        resetLink: token,
        expiryHours: '1',
        year: new Date().getFullYear(),
        companyName: 'Dev',
        appName: 'App',
      },
    });

    return true;
  }

  async reset(token: string, newPassword: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: { token },
    });

    if (!tokenEntity) {
      throw new BadRequestException('Token inválido');
    }
    if (tokenEntity.used) {
      throw new BadRequestException('Token já utilizado');
    }

    try {
      const decoded = this.jwtService.verify<{ id?: number | string }>(token, {
        issuer: 'forget',
        audience: 'app-users',
        secret: String(process.env.JWT_SECRET),
      });

      const rawId = decoded?.id;
      if (rawId === undefined || rawId === null || isNaN(Number(rawId))) {
        throw new BadRequestException('Token inválido');
      }

      const userId = Number(rawId);
      const hashed = await bcrypt.hash(
        newPassword.trim(),
        await bcrypt.genSalt(12),
      );

      const result = await this.userRepository.update(
        { id: userId },
        { password: hashed },
      );

      if (result.affected === 0) {
        throw new BadRequestException('Usuário não encontrado');
      }

      tokenEntity.used = true;
      tokenEntity.usedAt = new Date();
      await this.tokenRepository.save(tokenEntity);

      const user = await this.userRepository.findOneBy({ id: userId });
      return this.createToken(user);
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expirado');
      }
      throw new BadRequestException(err?.message ?? 'Token inválido');
    }
  }
}
