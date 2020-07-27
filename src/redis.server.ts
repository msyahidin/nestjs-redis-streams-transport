import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { RedisClient, createClient } from 'redis';
import { RedisStreamTransportOptions } from './interfaces';
import { RedisStreamContext } from './redis.stream.context';
import { replyToObject } from './utils/reply-to-object';

export class RedisStreamStrategy extends Server
  implements CustomTransportStrategy {
  private readonly url: string;
  private client: RedisClient;

  constructor(
    private readonly options?: RedisStreamTransportOptions['options']
  ) {
    super();

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  listen(callback: () => void): void {
    this.client = this.createRedisClient();
    this.start(callback);
  }

  close(): void {
    throw new Error('Method not implemented.');
  }

  private createRedisClient(): RedisClient {
    const options = this.options || {};
    return createClient(options);
  }

  // Internal methods
  public start(callback: () => void): void {
    // register redis message handlers
    this.bindHandlers();
    // call any user-supplied callback from `app.listen()` call
    callback();
  }

  public bindHandlers(): void {
    const patterns = [...this.messageHandlers.keys()];

    this.xread(patterns, async (pattern: string, stream: any) => {
      const [id, payload] = stream;
      const streamContext = new RedisStreamContext([pattern, id]);

      const handler = this.messageHandlers.get(pattern);
      if (handler) {
        let reply = replyToObject(payload);
        if (reply && reply.hasOwnProperty('message')) {
          reply = reply.message;
        }

        await handler(reply, streamContext);
      }
    });
  }

  private createConsumerGroupIfNotExists(
    stream: string,
    consumerGroup: string
  ) {
    return new Promise((res, rej) => {
      this.client.xgroup(
        'CREATE',
        stream,
        consumerGroup,
        '$',
        'MKSTREAM',
        (err) => {
          if (err && !err.message.includes('BUSYGROUP')) {
            rej(err);
            this.logger.error(err);
          } else if (err?.message.includes('BUSYGROUP')) {
            res();
          } else {
            this.logger.log(
              `Creating consumer group ${consumerGroup} for stream ${stream}`
            );
            res();
          }
        }
      );
    });
  }

  private async xreadGroup(
    streams: string[],
    consumerGroup: string,
    consumer: string,
    cb: (pattern: string, value: any) => void
  ) {
    this.client.xreadgroup(
      'GROUP',
      consumerGroup,
      consumer,
      'BLOCK',
      0,
      'NOACK',
      'STREAMS',
      ...streams,
      ...streams.map((_) => '>'),
      (err, str) => {
        if (err) return this.logger.warn(err, 'Error reading from stream: ');

        if (str) {
          str[0][1].forEach((message) => {
            cb(str[0][0], message);
          });
        }

        this.xread(streams, cb);
      }
    );
  }

  private async xread(stream: string[], cb: any): Promise<void> {
    if (this.options?.consumerGroup) {
      const { consumerGroup, consumer } = this.options;
      stream.forEach(async (stream) => {
        await this.createConsumerGroupIfNotExists(stream, consumerGroup);
      });
      this.xreadGroup(stream, consumerGroup, consumer, cb);
      return;
    }
    // without consumer group
    throw new Error('Method not yes implemented');
  }
}
