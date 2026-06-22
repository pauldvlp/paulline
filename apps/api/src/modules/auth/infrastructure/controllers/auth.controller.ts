import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { loginSchema } from '@paulline/schemas';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
import { AuthService } from '../../application/services/auth.service';
import type { LoginDto } from '../../application/dtos/login.dto';
import type { AuthSessionDto } from '../../application/dtos/auth-session.dto';

const loginValidationPipe = new ZodValidationPipe(loginSchema);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(loginValidationPipe) body: LoginDto): Promise<AuthSessionDto> {
    return this.authService.login(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): Promise<void> {
    return this.authService.logout();
  }
}
