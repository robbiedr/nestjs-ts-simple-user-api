import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Simple User Mgmt NestJS Typescript')
    .setDescription('Simple user management API built with NestJS Typescript')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  const swaggerOptions = {
    swaggerOptions: {
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };

  SwaggerModule.setup('api-docs', app, document, swaggerOptions);

  await app.listen(process.env.APP_PORT);
}
bootstrap();
