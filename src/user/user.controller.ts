import { Controller, Post, Body, Query, Get } from '@nestjs/common';
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

  @Get('activate')
  @ApiTags('Users')
  async activateUser(@Query('token') token: string): Promise<{
    success: boolean;
    message?: string;
    email?: string;
    error?: string;
  }> {
    try {
      const { message, email } = await this.userService.activateUser(token);
      return { success: true, message, email };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
