import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './database/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { SharedModule } from './shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfigService = new DatabaseConfigService(configService);
        return databaseConfigService.createTypeOrmOptions();
      },
    }),
    TypeOrmModule.forFeature([User]),
    SharedModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Enable Passport with the default 'jwt' strategy
    JwtModule.register({
      secret: process.env.TOKEN_SECRET_KEY, // Replace with your own secret key
      signOptions: { expiresIn: '1h' }, // Set the token expiration
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, JwtStrategy],
})
export class AppModule {}
