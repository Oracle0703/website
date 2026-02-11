import OSS from "ali-oss";
import type { JsonObjectStore } from "./types.js";

function normalizeEtag(etag: string | undefined): string | undefined {
  if (!etag) return undefined;
  // OSS typically returns quoted etag ("...")
  return etag.replace(/^"|"$/g, "");
}

export function createOssStore(params: {
  region: string;
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  prefix?: string;
}): JsonObjectStore {
  const prefix = params.prefix ?? "";

  const client = new OSS({
    region: params.region,
    endpoint: params.endpoint,
    bucket: params.bucket,
    accessKeyId: params.accessKeyId,
    accessKeySecret: params.accessKeySecret
  });

  function keyOf(key: string): string {
    if (!prefix) return key;
    return prefix.endsWith("/") ? `${prefix}${key.replace(/^\//, "")}` : `${prefix}/${key.replace(/^\//, "")}`;
  }

  return {
    async getJson<T>(key: string) {
      const objectKey = keyOf(key);
      const res = await client.get(objectKey);
      const body = typeof res.content === "string" ? res.content : res.content.toString("utf-8");
      return {
        value: JSON.parse(body) as T,
        etag: normalizeEtag((res as any).res?.headers?.etag as string | undefined)
      };
    },

    async putJson<T>(key: string, value: T, opts?: { ifMatch?: string }) {
      const objectKey = keyOf(key);
      const headers: Record<string, string> = {
        "Content-Type": "application/json; charset=utf-8"
      };
      if (opts?.ifMatch) headers["If-Match"] = opts.ifMatch;

      const res = await client.put(objectKey, Buffer.from(JSON.stringify(value, null, 2), "utf-8"), {
        headers
      });

      return {
        etag: normalizeEtag((res as any).res?.headers?.etag as string | undefined)
      };
    }
  };
}
