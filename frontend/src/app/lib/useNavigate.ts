import { buildPath } from "./navigate";

export function createNavigate() {
  return (page: string, extra?: Record<string, string>) => {
    if (typeof window === "undefined") return;
    const url = buildPath(page, extra);
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}
