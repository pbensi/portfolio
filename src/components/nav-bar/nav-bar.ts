import html from "./nav-bar.html?raw";
import css from "./nav-bar.css?raw";
import { Component } from "../../core/component.decorator";
import { AppState } from "../../services/state.service";
import BaseComponent from "../../core/component";
import { routes } from "../../router/routes";
import Contact from "../contact/contact";

@Component({
  tag: "app-navbar",
  template: html,
  styles: css,
  components: [Contact]
})
export default class NavBar extends BaseComponent {
  private activeEl: HTMLElement | null = null;
  private observer?: ResizeObserver;

  private onResize = () => this.syncSliderToActive();
  private onPopState = () => this.syncSliderToActive();
  private onAppStateChange = () => this.syncSliderToActive();

  public onInit(): void {
    this.renderNavLinks();
    this.initializeUI();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("popstate", this.onPopState);
    window.addEventListener("state-change", this.onAppStateChange);

    requestAnimationFrame(() => this.syncSliderToActive());
  }

  public onDestroy(): void {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("popstate", this.onPopState);
    window.removeEventListener("state-change", this.onAppStateChange);
    this.observer?.disconnect();
  }

  private initializeUI() {
    this.setupThemeAndLangSelectors();
    this.setupHamburgerMenu();
    this.setupContactPanel();

    const navList = this.shadow.querySelector(".nav-list") as HTMLElement | null;
    if (navList) {
      this.observer = new ResizeObserver(() => this.syncSliderToActive());
      this.observer.observe(navList);
    }
  }

  private setupThemeAndLangSelectors() {
    const theme = this.shadow.querySelector("#theme-select") as HTMLSelectElement | null;
    const lang = this.shadow.querySelector("#lang-select") as HTMLSelectElement | null;

    if (theme) {
      theme.value = AppState.theme;
      theme.onchange = e =>
        AppState.setTheme((e.target as HTMLSelectElement).value);
    }

    if (lang) {
      lang.value = AppState.language;
      lang.onchange = e =>
        AppState.setLanguage((e.target as HTMLSelectElement).value);
    }
  }

  private setupHamburgerMenu() {
    const btn = this.shadow.querySelector("#nav-toggle") as HTMLElement | null;
    const nav = this.shadow.querySelector(".nav-list") as HTMLElement | null;

    if (btn && nav) {
      btn.onclick = () => {
        btn.classList.toggle("active");
        nav.classList.toggle("open");
      };
    }
  }

  private setupContactPanel() {
    const toggleBtn = this.shadow.getElementById("contactToggle") as HTMLButtonElement | null;
    const panel = this.shadow.getElementById("contactPanel") as HTMLElement | null;

    if (toggleBtn && panel) {
      toggleBtn.onclick = e => {
        e.stopPropagation();
        panel.classList.toggle("active");
      };
    }
  }

  private renderNavLinks() {
    const nav = this.shadow.querySelector(".nav-list") as HTMLElement | null;
    if (!nav) return;

    const links = routes.filter(r => r.path && r.path !== "not-found");

    nav.innerHTML = `
      <div class="slider"></div>
      ${links.map(r =>
      `<li data-path="${r.path}" L="${r.path}">${r.path}</li>`
    ).join("")}
    `;

    this.applyTranslations();

    nav.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("app-navigate", { detail: { path: li.dataset.path } })
        );
        this.syncSliderToActive();
      });
    });
  }

  private syncSliderToActive() {
    let path = window.location.pathname;
    const baseUrl = import.meta.env.BASE_URL;

    if (path.startsWith(baseUrl)) path = path.slice(baseUrl.length);

    const rawPath = path.replace(/^\/|\/$/g, "");
    const menuPath = this.resolveMenuPath(rawPath);

    this.shadow.querySelectorAll(".nav-list li").forEach(el => el.classList.remove("active"));

    this.activeEl = this.shadow.querySelector(
      `.nav-list li[data-path="${menuPath}"]`
    ) as HTMLElement | null;

    if (this.activeEl) {
      this.activeEl.classList.add("active");
      this.moveSlider(this.activeEl);
    }
  }

  private resolveMenuPath(path: string): string {
    if (path === "") return "about";
    return path;
  }

  private moveSlider(el: HTMLElement) {
    const slider = this.shadow.querySelector(".slider") as HTMLElement | null;
    if (!slider || !el.parentElement) return;

    const navRect = el.parentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    Object.assign(slider.style, {
      width: `${elRect.width}px`,
      transform: `translateX(${elRect.left - navRect.left}px)`,
      opacity: "1"
    });
  }
}
