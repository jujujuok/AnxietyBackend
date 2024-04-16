import { RedisClientType, createClient } from "redis";
import { IDashboardItemDetails } from "../models/dashboard";
import { IWorldMapItemDetails } from "../models/world-map";
import { IMapItemDetails } from "../models/map";

export class Cache {
  constructor(private readonly client: RedisClientType) {
    this.client.on("error", (err) => {
      console.error(err);
    });

    this.client.connect();
  }

  public async close(): Promise<void> {
    await this.client.quit();
  }

  public set(
    key: string,
    value: IDashboardItemDetails | IWorldMapItemDetails | IMapItemDetails
  ): void {
    this.client.set(key, JSON.stringify(value));
  }

  public async get(
    key: string
  ): Promise<
    IDashboardItemDetails | IWorldMapItemDetails | IMapItemDetails | null
  > {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
