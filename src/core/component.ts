import { I18nService } from "../services/i18n.service";
import { AppState } from "../services/state.service";

export default abstract class BaseComponent extends HTMLElement {
    protected shadow: ShadowRoot;
    private boundStateChange: () => void;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.boundStateChange = () => this.onStateChange();
    }

    async connectedCallback() {
        window.addEventListener("state-change", this.boundStateChange);
        this.render();
        await this.applyTranslations();
        this.onInit();
    }

    disconnectedCallback() {
        window.removeEventListener("state-change", this.boundStateChange);
        this.onDestroy();
    }

    protected onStateChange() {
        this.applyTranslations();
    }

    protected async applyTranslations() {
        await I18nService.loadLanguage(AppState.language);
        const elements = this.shadow.querySelectorAll<HTMLElement>("[L]");
        elements.forEach(el => {
            const key = el.getAttribute("L")!;
            const args = JSON.parse(el.getAttribute("L-args") || "[]");
            const translated = I18nService.translate(key, args);
            if (el.textContent !== translated) el.textContent = translated;
        });
    }

    protected render() {
        const meta = this.constructor as any;
        const style = meta.__styles ? `<style>${meta.__styles}</style>` : "";
        this.shadow.innerHTML = `${style}${meta.__template}`;
    }

    public onInit() { }
    public onDestroy() { }
}
