import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PartialUpdateUserDTO } from './dto/partial-update-user.dto';
import { UserService } from './user.service';
import { ParamId } from 'src/decorators/param-id.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/auth.guard';

@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() { name, email, password, role }: CreateUserDTO) {
    return await this.userService.create({ name, email, password, role });
  }

  @Get()
  async getUsers() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async getUser(@ParamId() id: number) {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  async updateUser(@Body() data: UpdateUserDTO, @ParamId() id: number) {
    return {
      message: 'User updated',
      user: await this.userService.update(id, data),
    };
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async partialUpdateUser(
    @ParamId() id: number,
    @Body() data: PartialUpdateUserDTO,
  ) {
    return {
      message: 'User partially updated',
      user: await this.userService.updatePartial(id, data),
    };
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteUser(@ParamId() id: number) {
    return {
      message: 'User deleted',
      user: await this.userService.delete(id),
    };
  }
}
