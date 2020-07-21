## Description

Redis Streams server strategy and client module for [Nest](https://github.com/nestjs/nest) based on the [node-redis](https://github.com/NodeRedis/node-redis) package.

## Installation

```bash
$ npm i --save @hoogie/redis-stream-transport
```

## Usage

To use the Redis Streams transporter, pass the following options object to the `createMicroservice()` method:

```typescript
import { NestFactory } from '@nestjs/core';
import { RedisStreamStrategy } from '@hoogie/redis-streams-transport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<CustomStrategy>(AppModule, {
    strategy: new RedisStreamStrategy({
      // consumerGroup: 'example-group',
      // consumer: 'example-consumer',
    })
  });
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
```

### Client

To create a client instance with the `RedisStreamsClientModule`, import it and use the `register()` method to pass an options object with the redis connect properties.

```typescript
@Module({
  imports: [
    RedisStreamsClientModule.register({
      options: {
        url: 'redis://localhost:6379',
      }
    }),
  ]
  ...
})
```

Once the module has been imported, we can inject an instance of the `ClientProxy`

```typescript
constructor(
  private readonly client: ClientProxy,
) {}
```

Quite often you might want to asynchronously pass your module options instead of passing them beforehand. In such case, use `registerAsync()` method, that provides a couple of various ways to deal with async data.

**1. Use factory**

```typescript
RedisStreamsClientModule.registerAsync({
  useFactory: () => ({
    options: {
      url: 'redis://localhost:6379'
    }
  })
});
```

Obviously, our factory behaves like every other one (might be `async` and is able to inject dependencies through `inject`).

```typescript
RedisStreamsClientModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    options: {
      url: configService.get('REDIS_URL', undefined),
      password: configService.get('REDIS_PASSWORD', undefined),
    },
  }),
  inject: [ConfigService],
}),
```

## Stay in touch

- Author - [Mark op 't Hoog](https://gitlab.com/hoogie/nestjs-redis-streams-transport)

## License

Nest is [MIT licensed](LICENSE).
