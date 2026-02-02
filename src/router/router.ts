import BaseComponent from "../core/component";
import { Component } from "../core/component.decorator";
import { routes } from "./routes";

@Component({ tag: "router-outlet" })
export class RouterOutlet extends BaseComponent {
    private cachedViews: Record<string, BaseComponent> = {};
    private currentTag: string | null = null;

    onInit() {
        window.addEventListener("popstate", () => this.handleRoute());
        window.addEventListener("app-navigate", (e: any) => {
            const path = e.detail.path.startsWith("/") ? e.detail.path : `/${e.detail.path}`;
            history.pushState({}, "", path);
            this.handleRoute();
        });

        this.handleRoute();
    }

    onDestroy() {
        Object.values(this.cachedViews).forEach(view => view.onDestroy?.());
        this.cachedViews = {};
    }

    private async handleRoute() {
        let path = location.pathname.replace(import.meta.env.BASE_URL, "");
        const cleanPath = path.replace(/^\/|\/$/g, "");
        const route = routes.find(r => r.path === cleanPath) || routes.find(r => r.path === "not-found");
        if (!route) return;

        const newTag = route.tag;

        if (this.currentTag && this.currentTag !== newTag) {
            const oldView = this.cachedViews[this.currentTag];
            if (oldView) {
                oldView.onDestroy?.();
                oldView.remove();
                delete this.cachedViews[this.currentTag];
            }
        }

        if (!this.cachedViews[newTag]) {
            await route.loader();
            this.cachedViews[newTag] = document.createElement(newTag) as BaseComponent;
        }

        this.shadow.replaceChildren(this.cachedViews[newTag]);
        this.currentTag = newTag;
    }
}
