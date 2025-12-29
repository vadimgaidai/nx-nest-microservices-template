import { Controller, Get } from '@nestjs/common';
import { DEFAULT_PAGE } from '@nx-microservices/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    void DEFAULT_PAGE;
    return this.appService.getData();
  }
}
