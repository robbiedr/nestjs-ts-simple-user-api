import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRegistrationDto } from './user-registration.dto';
import { EmailService } from '../shared/email.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserLoginDto } from './user-login.dto';
import * as bcrypt from 'bcryptjs';
import { UserChangePasswordDto } from './user-change-password.dto';
import { UserProfileDto } from './user-profile.dto';
import { UserDetailsDto } from './user-details.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async isEmailExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user; // Returns true if user is found, false otherwise
  }

  async registerUser(userData: UserRegistrationDto): Promise<User> {
    const { email } = userData;

    // Check if email already exists
    const emailExists = await this.isEmailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(
      userData.password,
      bcrypt.genSaltSync(10),
    );

    const user = new User();
    user.email = userData.email;
    user.password = hashedPassword;
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.isActive = false;

    const savedUser = await this.userRepository.save(user);

    // Send activation email with token to the user's email address
    // Implement the logic for sending the email
    // Send activation email with activation link to the user's email address
    const activationToken = jwt.sign(
      { email: user.email },
      this.configService.get<string>('TOKEN_SECRET_KEY'),
      { expiresIn: '1h' },
    ); // Generate activation token using JWT
    const activationLink = `${this.configService.get<string>(
      'API_BASE_PATH',
    )}/users/activate?token=${activationToken}`;
    this.emailService.sendActivationEmail(savedUser.email, activationLink);

    return savedUser;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async activateUser(
    token: string,
  ): Promise<{ message?: string; email?: string }> {
    let user: User;
    let email: string;

    try {
      const decodedToken = jwt.verify(
        token,
        this.configService.get<string>('TOKEN_SECRET_KEY'),
      ) as {
        email: string;
      };
      email = decodedToken.email;
    } catch (error) {
      throw new HttpException(
        'Invalid activation token',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      user = await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user || user.isActive) {
      throw new HttpException(
        'Invalid activation token',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      user.isActive = true;
      await this.userRepository.save(user);
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'User account activated successfully',
      email: user.email,
    };
  }

  async loginUser(loginData: UserLoginDto): Promise<{ bearerToken: string }> {
    const user = await this.findByEmail(loginData.email);

    if (!user) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isActive) {
      throw new HttpException('Inactive account', HttpStatus.UNAUTHORIZED);
    }

    delete user.password;
    const bearerToken = jwt.sign(
      { ...user },
      this.configService.get<string>('TOKEN_SECRET_KEY'),
      { expiresIn: '1h' },
    );

    return { bearerToken };
  }

  async changePassword(
    changePasswordData: UserChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, userId } = changePasswordData;
    let user;
    try {
      // Check if the current password matches the user's password
      user = await this.findByUserId(userId);
    } catch (DBError) {
      throw new Error(DBError.message);
    }

    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      throw new HttpException(
        'Invalid current password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (currentPassword === newPassword) {
      throw new HttpException('Invalid new password', HttpStatus.BAD_REQUEST);
    }

    try {
      // Update the user's password with the new one
      user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
      await this.userRepository.save(user);
    } catch (DBError) {
      throw new Error(DBError.message);
    }

    return {
      message: 'Password changed successfully',
    };
  }

  async findByUserId(id: string, select?: (keyof User)[]): Promise<User> {
    return this.userRepository.findOne({ where: { id }, select });
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    let user;
    try {
      user = await this.findByUserId(userId, [
        'id',
        'firstName',
        'lastName',
        'email',
      ]);

      return user;
    } catch (DBError) {
      throw new Error(DBError.message);
    }
  }

  async getUsers(page: number, limit: number): Promise<UserDetailsDto[]> {
    const skip = (page - 1) * limit;
    const users = await this.userRepository.find({
      skip,
      take: limit,
      select: ['id', 'firstName', 'lastName', 'email'], // Adjust the select fields as per your needs,
      order: { createdAt: 'DESC' },
    });
    return users;
  }
}
