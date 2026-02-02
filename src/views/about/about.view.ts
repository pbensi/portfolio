import html from "./about.view.html?raw";
import css from "./about.view.css?raw";
import BaseComponent from "../../core/component";
import { Component } from "../../core/component.decorator";
import ContactDetail from "../../components/contact-detail/contact-detail";

@Component({
    tag: "app-about-view",
    template: html,
    styles: css,
    components: [
        ContactDetail
    ]
})
export default class AboutView extends BaseComponent {
    public onInit(): void {

    }
}
