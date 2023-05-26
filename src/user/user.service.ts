import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRegistrationDto } from './user-registration.dto';
import { EmailService } from '../shared/email.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

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

    const user = new User();
    user.email = userData.email;
    user.password = userData.password;
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
}