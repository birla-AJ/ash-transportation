import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const { method, originalUrl, ip } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse();
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} - ${Date.now() - start}ms - ${ip}`,
          );
        },
        error: (err) => {
          this.logger.error(
            `${method} ${originalUrl} - ${Date.now() - start}ms - ${err.message}`,
          );
        },
      }),
    );
  }
}
