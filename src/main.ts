import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix(configService.get('API_PREFIX'));

    const port = configService.get<number>('APP_PORT');
    await app.listen(port);
}
bootstrap();
