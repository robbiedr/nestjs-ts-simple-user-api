import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegistrationDto } from './user-registration.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserLoginDto } from './user-login.dto';
import { UserChangePasswordDto } from './user-change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProfileDto } from './user-profile.dto';
import { UserDetailsDto } from './user-details.dto';
import { UserDetailsFilterDto } from './user-details-filter.dto';

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

  @Post('login')
  @ApiTags('Users')
  async login(
    @Body() loginData: UserLoginDto,
  ): Promise<{ bearerToken?: string; error?: string }> {
    try {
      const { bearerToken } = await this.userService.loginUser(loginData);
      return { bearerToken };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('change-password')
  @ApiTags('Users')
  @UseGuards(JwtAuthGuard) // Apply JwtAuthGuard to protect the endpoint
  @ApiBearerAuth() // Add this decorator to require bearer token in Swagger
  async changePassword(
    @Body() changePasswordData: UserChangePasswordDto,
    @Request() request: any, // Add the `@Request()` decorator
  ): Promise<{
    status: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      changePasswordData.userId = request.user.userId; // Access the `userId` from the request object
      const { message } = await this.userService.changePassword(
        changePasswordData,
      );
      return { status: true, message };
    } catch (error) {
      return { status: false, error: error.message };
    }
  }

  @Get('profile')
  @ApiTags('Users')
  @UseGuards(JwtAuthGuard) // Apply JwtAuthGuard to protect the endpoint
  @ApiBearerAuth()
  async getUserProfile(@Request() request: any): Promise<UserProfileDto> {
    try {
      const userId = request.user.userId; // Access the `userId` from the request object
      const user = await this.userService.getUserProfile(userId);
      return user;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('')
  @ApiTags('Users')
  async getUsers(
    @Query() query: UserDetailsFilterDto,
  ): Promise<UserDetailsDto[] | { error: string }> {
    try {
      const { page, limit, search } = query;
      const users = await this.userService.getUsers(page, limit, search);
      return users;
    } catch (error) {
      return { error: error.message };
    }
  }
}
