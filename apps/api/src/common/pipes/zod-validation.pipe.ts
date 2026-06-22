import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';

export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: ZodSchema<TOutput>) {}

  transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join('; ');
      throw new BadRequestException({
        error: { code: VALIDATION_ERROR_CODE, message },
      });
    }

    return result.data;
  }
}
