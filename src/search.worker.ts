import { search } from "./search";
import type { SearchIndex, SearchPolicy } from "../shared/types/publication";
type Request = { id: number; query: string; index?: SearchIndex; policy?: SearchPolicy };
let index: SearchIndex | undefined;
let policy: SearchPolicy | undefined;
self.onmessage = (event: MessageEvent<Request>) => {
  const request = event.data;
  index = request.index ?? index;
  policy = request.policy ?? policy;
  try {
    if (!index || !policy) throw new Error("Search has not been explicitly prepared");
    self.postMessage({ id: request.id, hits: search(request.query, index, policy) });
  } catch (error) {
    self.postMessage({ id: request.id, error: error instanceof Error ? error.message : String(error) });
  }
};
