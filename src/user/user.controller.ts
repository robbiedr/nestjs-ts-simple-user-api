import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegistrationDto } from './user-registration.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiTags('Users')
  async register(@Body() userData: UserRegistrationDto) {
    try {
      const user = await this.userService.registerUser(userData);
      return { user };
    } catch (error) {
      return { error: error.message };
    }
  }
}
