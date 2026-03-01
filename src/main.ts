import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { I18nErrorExceptionFilter } from './i18n/i18n-error-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);
  const prefix = configService.get<string>('PREFIX')!;

  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true }));
  app.useGlobalFilters(
    new I18nErrorExceptionFilter(),
    new I18nValidationExceptionFilter({
      detailedErrors: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE')!)
    .setDescription(configService.get<string>('SWAGGER_DESCRIPTION')!)
    .setVersion(configService.get<string>('SWAGGER_VERSION')!)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(prefix, app, documentFactory);

  await app.register(fastifyCookie);
  await app.listen({
    host: configService.get<string>('HOST'),
    port: configService.get<number>('PORT'),
  });
}
bootstrap();
