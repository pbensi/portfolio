
import html from "./not-found.html?raw";
import css from "./not-found.css?raw";
import BaseComponent from "../../core/component";
import { Component } from "../../core/component.decorator";

@Component({
  tag: "app-not-found",
  template: html,
  styles: css,
  components: []
})
export default class NotFound extends BaseComponent {
  public onInit(): void {

  }
}
