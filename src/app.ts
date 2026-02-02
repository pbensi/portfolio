import BaseComponent from "./core/component";
import NavBar from "./components/nav-bar/nav-bar";

import html from "./app.html?raw";
import css from "./app.css?raw";
import { RouterOutlet } from "./router/router";
import { Component } from "./core/component.decorator";
import { AppState } from "./services/state.service";
import { I18nService } from "./services/i18n.service";
import { initSecurity } from "./security";

@Component({
    tag: "app-root",
    template: html,
    styles: css,
    components: [
        NavBar,
        RouterOutlet
    ]
})
export default class App extends BaseComponent {
    public onInit(): void {
        const currentYear = this.shadow.getElementById('current-year') as HTMLSpanElement | null;
        if (currentYear) {
            currentYear.innerText = new Date().getFullYear().toString();
        }

        initSecurity();
    }
    public onDestroy(): void {

    }
}

document.documentElement.setAttribute('data-theme', AppState.theme);

document.addEventListener("DOMContentLoaded", async () => {
    await I18nService.loadLanguage(AppState.language);

    document.body.appendChild(document.createElement("app-root"));
});