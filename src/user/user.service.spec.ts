import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../shared/email.service';
import { UserRegistrationDto } from './user-registration.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        EmailService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      // Mock data
      const userData: UserRegistrationDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Mock dependencies
      const emailExists = false;
      const savedUser = new User();
      savedUser.email = userData.email;
      savedUser.password = 'hashedPassword';
      savedUser.firstName = userData.firstName;
      savedUser.lastName = userData.lastName;
      savedUser.isActive = false;

      const isEmailExistsMock = jest
        .spyOn(userService, 'isEmailExists')
        .mockResolvedValue(emailExists);
      const bcryptHashSyncMock = jest
        .spyOn(bcrypt, 'hashSync')
        .mockReturnValue('hashedPassword');
      const userRepositorySaveMock = jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(savedUser);
      const configServiceGetMock = jest
        .spyOn(configService, 'get')
        .mockReturnValue('TOKEN_SECRET_KEY');
      const emailServiceSendActivationEmailMock = jest
        .spyOn(emailService, 'sendActivationEmail')
        .mockImplementation();

      // Call the registerUser method
      const result = await userService.registerUser(userData);

      // Assertions
      expect(isEmailExistsMock).toHaveBeenCalledWith(userData.email);
      expect(userService.isEmailExists(userData.email)).resolves.toBe(false);
      expect(bcryptHashSyncMock).toHaveBeenCalledWith(
        userData.password,
        expect.any(String),
      );
      expect(userRepositorySaveMock).toHaveBeenCalledWith(
        expect.objectContaining(savedUser),
      );
      expect(configServiceGetMock).toHaveBeenCalledWith('TOKEN_SECRET_KEY');
      expect(emailServiceSendActivationEmailMock).toHaveBeenCalledWith(
        savedUser.email,
        expect.any(String),
      );
      expect(result).toEqual(savedUser);
    });

    it('should throw an error if email already exists', async () => {
      // Mock data
      const userData: UserRegistrationDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Mock dependencies
      const emailExists = true;

      const isEmailExistsMock = jest
        .spyOn(userService, 'isEmailExists')
        .mockResolvedValue(emailExists);

      // Call the registerUser method and expect it to throw an error
      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Email already exists',
      );

      // Assertion
      expect(isEmailExistsMock).toHaveBeenCalledWith(userData.email);
    });
  });

  describe('activateUser', () => {
    it('should activate user account when provided with a valid activation token', async () => {
      // Mock data
      const token = 'valid_token';
      const email = 'test@example.com';

      // Mock decoded token
      const decodedToken = { email };

      // Mock user object
      const user = new User();
      user.email = email;
      user.isActive = false;

      // Mock findOne method
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Mock verify method
      const verifyMock = jest.spyOn(jwt, 'verify');
      verifyMock.mockImplementation((token) => {
        // Custom implementation based on your test scenario
        if (token === 'valid_token') {
          return decodedToken;
        } else {
          throw new Error('Invalid token');
        }
      });

      // Mock the userRepository.save method
      const saveMock = jest.spyOn(userRepository, 'save');
      saveMock.mockImplementation((user: DeepPartial<User>) => {
        user.isActive = true;
        return Promise.resolve(user as DeepPartial<User> & User);
      });

      // Call the activateUser method
      const result = await userService.activateUser(token);

      // Assertions
      expect(user.isActive).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        message: 'User account activated successfully',
        email: user.email,
      });
    });

    it('should throw an HttpException with status 400 when provided with an invalid activation token', async () => {
      // Mock data
      const token = 'invalid_token';

      // Mock verify method to throw an error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Call the activateUser method and expect it to throw an HttpException
      await expect(userService.activateUser(token)).rejects.toThrowError(
        new HttpException('Invalid activation token', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an HttpException with status 400 when user account is already active', async () => {
      // Mock data
      const token = 'valid_token';
      const email = 'test@example.com';

      // Mock decoded token
      const decodedToken = { email };

      // Mock user object
      const user = new User();
      user.email = email;
      user.isActive = true;

      // Mock findOne method
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Mock verify method
      const verifyMock = jest.spyOn(jwt, 'verify');
      verifyMock.mockImplementation((token) => {
        // Custom implementation based on your test scenario
        if (token === 'valid_token') {
          return decodedToken;
        } else {
          throw new Error('Invalid token');
        }
      });
      // Call the activateUser method and expect it to throw an HttpException
      await expect(userService.activateUser(token)).rejects.toThrowError(
        new HttpException('Invalid activation token', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an HttpException with status 500 when there is a database error', async () => {
      // Mock data
      const token = 'valid_token';
      const email = 'test@example.com';

      // Mock decoded token
      const decodedToken = { email };

      // Mock findOne method to throw an error
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      // Mock verify method
      const verifyMock = jest.spyOn(jwt, 'verify');
      verifyMock.mockImplementation((token) => {
        // Custom implementation based on your test scenario
        if (token === 'valid_token') {
          return decodedToken;
        } else {
          throw new Error('Invalid token');
        }
      });

      // Call the activateUser method and expect it to throw an HttpException
      await expect(userService.activateUser(token)).rejects.toThrowError(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
