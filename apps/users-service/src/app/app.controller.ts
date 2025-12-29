import { Controller, Get } from '@nestjs/common';
import { type ApiResponse } from '@nx-microservices/contracts';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    // ApiResponse type available for future use
    type _Proof = ApiResponse<{ message: string }>;
    return this.appService.getData();
  }
}
