import {
  ClientProxy,
  ReadPacket,
  RedisOptions,
  WritePacket,
} from '@nestjs/microservices';
import { Logger, Injectable, Inject } from '@nestjs/common';
import {
  RedisClient,
  createClient,
  ClientOpts,
  RetryStrategyOptions,
} from 'redis';
import { Subject, merge, fromEvent } from 'rxjs';
import { share, take } from 'rxjs/operators';
import { CONNECT_EVENT, ERROR_EVENT } from '@nestjs/microservices/constants';
import { get as _get } from 'lodash';
import { ECONNREFUSED, REDIS_STREAMS_CLIENT_MODULE_OPTIONS } from './constants';

@Injectable()
export class RedisStreamClient extends ClientProxy {
  protected readonly logger = new Logger(ClientProxy.name);
  protected readonly subscriptionsCount = new Map<string, number>();
  protected readonly url?: string;
  protected client: RedisClient;
  protected options: RedisOptions['options'];

  protected connection: Promise<any>;
  protected isExplicitlyTerminated = false;

  constructor(
    @Inject(REDIS_STREAMS_CLIENT_MODULE_OPTIONS)
    options?: RedisOptions['options']
  ) {
    super();

    this.options = options ?? {};
    this.url = _get(this.options, 'url');

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  connect(): Promise<any> {
    return this.connection ?? this.createConnection();
  }

  private createConnection() {
    const error$ = new Subject<Error>();

    this.client = this.createClient(error$);
    this.handleError(this.client);

    const connect$ = fromEvent(this.client, CONNECT_EVENT);

    this.connection = merge(error$, connect$)
      .pipe(take(1), share())
      .toPromise();

    return this.connection;
  }

  public handleError(client: RedisClient): void {
    client.addListener(ERROR_EVENT, (err: any) => this.logger.error(err));
  }

  public createClient(error$: Subject<Error>): RedisClient {
    return createClient({
      ...this.getClientOptions(error$),
      password: this.options?.password,
      url: this.url,
    });
  }

  public getClientOptions(error$: Subject<Error>): Partial<ClientOpts> {
    const retry_strategy = (options: RetryStrategyOptions) =>
      this.createRetryStrategy(options, error$);

    const options = this.options as any;
    return {
      ...options.options,
      retry_strategy,
    };
  }

  public createRetryStrategy(
    options: RetryStrategyOptions,
    error$: Subject<Error>
  ): undefined | number | Error {
    if (options.error && (options.error as any).code === ECONNREFUSED) {
      error$.error(options.error);
    }
    if (this.isExplicitlyTerminated) {
      return undefined;
    }
    if (
      !_get(this.options, 'retryAttempts', options.attempt) ||
      options.attempt > _get(this.options, 'retryAttempts', 0)
    ) {
      return new Error('Retry time exhausted');
    }
    return _get(this.options, 'retryDelay', 0);
  }

  close(): void {
    this.isExplicitlyTerminated = true;
    this.client && this.client.quit();
  }

  protected publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void
  ): () => any {
    throw new Error('Method not implemented.');
  }

  protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T> {
    const pattern = this.normalizePattern(packet.pattern);
    const serializedPacket = this.serializer.serialize(packet);
    const payload = serializedPacket.data;
    const canBeSerialized = (arg: any) =>
      typeof arg === 'object' && arg !== null && !Array.isArray(arg);

    if (canBeSerialized(payload)) {
      const redisArgs = Object.entries(payload).flatMap(([property, value]) => [
        property,
        canBeSerialized(value) ? JSON.stringify(value) : value,
      ]) as string[];
      return new Promise((resolve, reject) =>
        this.client.xadd(pattern, '*', ...redisArgs, (err) => {
          err ? reject(err) : resolve();
        })
      );
    }

    return new Promise((resolve, reject) =>
      this.client.xadd(
        pattern,
        '*',
        'message',
        Array.isArray(payload) ? JSON.stringify(payload) : payload,
        (err) => {
          err ? reject(err) : resolve();
        }
      )
    );
  }
}
