import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PartialUpdateUserDTO } from './dto/partial-update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ email, name, password, role }: CreateUserDTO) {
    return await this.prisma.user.create({
      data: {
        email,
        name,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
        role,
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    await this.exists(id);
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, { email, name, password, role }: UpdateUserDTO) {
    await this.exists(id);

    return await this.prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
        role,
      },
    });
  }

  async updatePartial(id: number, data: PartialUpdateUserDTO) {
    await this.exists(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());
    }
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    await this.exists(id);
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
