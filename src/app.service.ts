import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(body: any): string {
    return body;
  }
}
