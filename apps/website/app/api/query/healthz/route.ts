import { freeQueryService } from "../../../../lib/free-query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return freeQueryService.health(request);
}
