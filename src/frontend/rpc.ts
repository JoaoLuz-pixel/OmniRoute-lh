// Typed wrapper over ctx.call. The server part always answers with Result<T>.
import type { PluginFrontendContext } from "learnharness-plugin-api";
import type { PluginErrorInfo, Result } from "../shared/protocol.ts";

export class RpcError extends Error {
  constructor(readonly info: PluginErrorInfo) {
    super(info.message);
  }
}

export type Rpc = <T>(op: string, input?: unknown) => Promise<T>;

export function makeRpc(ctx: PluginFrontendContext): Rpc {
  return async <T>(op: string, input?: unknown): Promise<T> => {
    let r: Result<T>;
    try {
      r = await ctx.call<Result<T>>(op, input ?? {});
    } catch (error) {
      throw new RpcError({ kind: "unreachable", message: `The plugin's server part didn't answer (${(error as Error).message}).` });
    }
    if (!r || typeof r !== "object" || !("ok" in r)) throw new RpcError({ kind: "bad-response", message: "Unexpected answer from the plugin's server part." });
    if (!r.ok) throw new RpcError(r.error);
    return r.value;
  };
}
