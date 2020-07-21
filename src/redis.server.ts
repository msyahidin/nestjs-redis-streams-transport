import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { RedisClient, createClient } from 'redis';
import { RedisStreamTransportOptions } from './interfaces';
import { RedisStreamContext } from './redis.stream.context';

export class RedisStreamStrategy extends Server
  implements CustomTransportStrategy {
  private readonly url: string;
  private client: RedisClient;

  constructor(
    private readonly options?: RedisStreamTransportOptions['options'],
  ) {
    super();

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  listen(callback: () => void) {
    this.client = this.createRedisClient();
    this.start(callback);
  }
  close() {
    throw new Error('Method not implemented.');
  }

  private createRedisClient(): RedisClient {
    const options = this.options || {};
    return createClient(options);
  }

  // Internal methods
  public start(callback: () => void) {
    // register redis message handlers
    this.bindHandlers();
    // call any user-supplied callback from `app.listen()` call
    callback();
  }

  public bindHandlers() {
    this.messageHandlers.forEach((handler, pattern) => {
      if (handler.isEventHandler) {
        this.xread(pattern, async stream => {
          const [id, payload] = stream;
          const streamContext = new RedisStreamContext([pattern, id]);
          const { data } = this.deserializer.deserialize(
            JSON.parse(payload[1]),
          );
          await handler(data, streamContext);
        });
      }
    });
  }

  private createConsumerGroupIfNotExists(
    stream: string,
    consumerGroup: string,
  ) {
    this.client.xgroup(
      'CREATE',
      stream,
      consumerGroup,
      '$',
      'MKSTREAM',
      err => {
        if (err && !err.message.includes('BUSYGROUP')) {
          return this.logger.error(err);
        }
      },
    );
  }

  private async xread(stream: string, cb: any) {
    if (this.options?.consumerGroup) {
      const { consumerGroup, consumer } = this.options;
      this.createConsumerGroupIfNotExists(stream, consumerGroup);

      this.client.xreadgroup(
        'GROUP',
        consumerGroup,
        consumer,
        'BLOCK',
        0,
        'NOACK',
        'STREAMS',
        stream,
        '>',
        (err, str) => {
          if (err) return this.logger.warn(err, 'Error reading from stream: ');

          if (str) {
            str[0][1].forEach(message => {
              cb(message);
            });
          }

          this.xread(stream, cb);
        },
      );
    }
  }
}
