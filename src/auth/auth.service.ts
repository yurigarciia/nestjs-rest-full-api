import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

// DA PRA MELHORAR A LOGICA DOS TOKENS, GUARDANDO ELES EM UMA TABELA NO BANCO
// PARA TER O CONTROLE DE QUANTOS TOKENS ATIVOS UM USUÁRIO TEM.

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async createToken(user: User) {
    const payload = { id: user.id, name: user.name, email: user.email };
    const options = {
      expiresIn: '7d',
      subject: user.id.toString(),
      issuer: 'app-backend-login',
      audience: 'app-users',
    };
    return { accessToken: this.jwtService.sign(payload, options) };
  }

  checkToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
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
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      acessToken: (await this.createToken(user)).accessToken,
      user: user,
    };
  }

  async register({ email, password, name }: AuthRegisterDTO) {
    const user = await this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
        name,
      },
    });
    return {
      acessToken: (await this.createToken(user)).accessToken,
      user: user,
    };
  }

  async forget(email: string) {
    const user = await this.prisma.user.findFirst({
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
      },
    );

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
    try {
      const decoded = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'app-users',
      });

      if (isNaN(Number(decoded.id))) {
        throw new BadRequestException('Invalid token');
      }

      const userId = decoded.id;
      const user = await this.prisma.user.update({
        where: { id: Number(userId) },
        data: {
          password: await bcrypt.hash(
            newPassword.trim(),
            await bcrypt.genSalt(),
          ),
        },
      });

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
    // DA PRA MELHORAR A LÓGICA, GUARDANDO OS TOKENS DE RESET NO BANCO
    // PARA NÃO USAR O MESMO TOKEN MAIS DE UMA VEZ
  }
}
