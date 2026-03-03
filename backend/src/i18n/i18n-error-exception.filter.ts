import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { I18nContext } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const i18n = I18nContext.current(host)!;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();

    response.status(status).send({
      statusCode: status,
      message: i18n.t(`error.${exception.message}`, { lang: i18n.lang }),
      error: exception.name,
    });
  }
}
