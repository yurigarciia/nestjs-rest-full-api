import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PartialUpdateUserDTO } from './dto/partial-update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create({ email, name, password, role }: CreateUserDTO) {
    const user = await this.findOneByEmail(email);
    if (user) {
      throw new ConflictException('User already exists');
    }
    return this.userRepository.save({
      email,
      name,
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
      role,
    });
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findOne(id: number) {
    await this.exists(id);
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, { email, name, password, role }: UpdateUserDTO) {
    await this.exists(id);
    await this.userRepository.update(id, {
      email,
      name,
      password: await bcrypt.hash(password, await bcrypt.genSalt()),
      role,
    });
    return this.findOne(id);
  }

  async updatePartial(id: number, data: PartialUpdateUserDTO) {
    await this.exists(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());
    }
    await this.userRepository.update(id, {
      ...data,
    });
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.exists(id);
    return await this.userRepository.delete({ id });
  }

  async exists(id: number) {
    if (!(await this.userRepository.exists({ where: { id } }))) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
