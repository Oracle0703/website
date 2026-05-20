export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export type GetJsonResult<T> = {
  value: T;
  etag?: string;
};

export type PutJsonResult = {
  etag?: string;
};

export interface JsonObjectStore {
  getJson<T>(key: string): Promise<GetJsonResult<T>>;
  putJson<T>(key: string, value: T, opts?: { ifMatch?: string; ifNoneMatch?: "*" }): Promise<PutJsonResult>;
}
