import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InvalidApiTokenError } from '../../modules/auth/domain/errors/invalid-api-token.error';
import { CredentialNotFoundError } from '../../modules/auth/domain/errors/credential-not-found.error';

const INTERNAL_ERROR_CODE = 'INTERNAL_ERROR';
const INTERNAL_ERROR_MESSAGE = 'An unexpected error occurred';

type ErrorBody = {
  error: { code: string; message: string };
};

const isErrorBody = (value: unknown): value is ErrorBody =>
  typeof value === 'object' &&
  value !== null &&
  'error' in value &&
  typeof (value as ErrorBody).error?.code === 'string';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (code: number) => { json: (body: ErrorBody) => void };
    }>();

    const { status, body } = this.resolve(exception);
    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof InvalidApiTokenError) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        body: { error: { code: exception.code, message: exception.message } },
      };
    }

    if (exception instanceof CredentialNotFoundError) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        body: { error: { code: exception.code, message: exception.message } },
      };
    }

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      if (isErrorBody(responseBody)) {
        return { status: exception.getStatus(), body: responseBody };
      }
      return {
        status: exception.getStatus(),
        body: { error: { code: INTERNAL_ERROR_CODE, message: exception.message } },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: INTERNAL_ERROR_CODE, message: INTERNAL_ERROR_MESSAGE } },
    };
  }
}
