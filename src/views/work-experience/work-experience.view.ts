
import html from "./work-experience.view.html?raw";
import css from "./work-experience.view.css?raw";
import { Component } from "../../core/component.decorator";
import BaseComponent from "../../core/component";

@Component({
    tag: "app-workexperience-view",
    template: html,
    styles: css,
    components: []
})
export default class WorkExperienceView extends BaseComponent {
    public onInit(): void {
        
    }
}
