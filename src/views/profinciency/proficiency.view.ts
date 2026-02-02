
import html from "./proficiency.view.html?raw";
import css from "./proficiency.view.css?raw";
import BaseComponent from "../../core/component";
import { Component } from "../../core/component.decorator";

@Component({
    tag: "app-proficiency-view",
    template: html,
    styles: css,
    components: []
})
export default class ProficiencyView extends BaseComponent {
    private resizeHandler: () => void;

    constructor() {
        super();
        this.resizeHandler = this.initGalaxy.bind(this);
    }

    public onInit(): void {
        this.initGalaxy();
        window.addEventListener('resize', this.resizeHandler);
    }

    private initGalaxy(): void {
        if (!this.shadowRoot) return;

        const satellites = this.shadowRoot.querySelectorAll<HTMLDivElement>('.satellite');
        const total = satellites.length;
        const duration = 22;

        satellites.forEach((sat, i) => {
            const angle = (i / total) * (Math.PI * 2) + 1.5708;

            sat.style.setProperty('--cos', Math.cos(angle).toString());
            sat.style.setProperty('--sin', Math.sin(angle).toString());

            const card = sat.querySelector<HTMLElement>('.glass-card');
            if (card) {
                const delay = (i / total) * -duration;
                card.style.animationDelay = `${delay}s`;
            }
        });
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandler);
    }
}
