import { Controller, Get } from '@nestjs/common';

import { DEFAULT_LIMIT } from '@nx-microservices/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    void DEFAULT_LIMIT;
    return this.appService.getData();
  }
}
