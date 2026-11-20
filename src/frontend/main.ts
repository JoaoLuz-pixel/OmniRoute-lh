// Browser part entry (dist/main.js). Plugin API v1 as in LearnHarness v0.6.1.
import type { PluginFrontendContext } from "learnharness-plugin-api";
import { VIEW_ID } from "../shared/protocol.ts";
import { makeRpc } from "./rpc.ts";
import { mountSettings } from "./settings.ts";
import { mountView } from "./view.ts";

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6h3a4 4 0 0 1 4 4v0a2 2 0 0 0 2 2h1"/><path d="M7 18h3a4 4 0 0 0 4-4"/></svg>';

export function activate(ctx: PluginFrontendContext) {
  const rpc = makeRpc(ctx);
  let remount: (() => void) | null = null;

  ctx.registerView({
    id: VIEW_ID,
    name: "OmniRoute",
    mount(container, signal) {
      const mountOnce = () => {
        container.replaceChildren();
        const stop = mountView(ctx, rpc, container, signal);
        signal.addEventListener("abort", stop, { once: true });
        return stop;
      };
      let stop = mountOnce();
      remount = () => {
        stop();
        stop = mountOnce();
      };
      return () => {
        remount = null;
        stop();
      };
    },
  });

  ctx.registerAction({ id: "open-omniroute", name: "OmniRoute", icon: ICON, run: () => ctx.app.openView(VIEW_ID) });
  ctx.placeAction({ id: "omniroute-sidebar", actionId: "open-omniroute", location: "sidebar" });

  ctx.registerAction({ id: "refresh-omniroute", name: "Refresh", run: () => remount?.() });
  ctx.placeAction({ id: "omniroute-refresh", actionId: "refresh-omniroute", location: "top-bar", views: [VIEW_ID] });

  ctx.registerSettings((container: HTMLElement, signal: AbortSignal) => {
    mountSettings(ctx, rpc, container, signal);
  });
}
