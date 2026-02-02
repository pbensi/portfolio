import html from "./contact-detail.html?raw";
import css from "./contact-detail.css?raw";
import BaseComponent from "../../core/component";
import { Component } from "../../core/component.decorator";

@Component({
  tag: "app-contact-detail",
  template: html,
  styles: css,
  components: []
})
export default class ContactDetail extends BaseComponent {
  public onInit(): void {

  }
}