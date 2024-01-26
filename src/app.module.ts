import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import Configs from 'src/config/index';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from './connection/connection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: Configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    UserModule,
    ConnectionModule
  ],
  controllers: [AppController], 
  providers: [AppService],
})
export class AppModule {}
