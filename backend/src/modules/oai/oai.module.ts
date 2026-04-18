import { Module } from '@nestjs/common';
import { OaiController } from './oai.controller';
import { OaiService } from './oai.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OaiController],
  providers: [OaiService],
})
export class OaiModule {}
