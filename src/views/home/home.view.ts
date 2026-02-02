
import html from "./home.view.html?raw";
import css from "./home.view.css?raw";
import { ImageParticle } from "../../utils/image-particle";
import BaseComponent from "../../core/component";
import { Component } from "../../core/component.decorator";
import WorkExperienceView from "../work-experience/work-experience.view";
import ProficiencyView from "../profinciency/proficiency.view";

@Component({
  tag: "app-home-view",
  template: html,
  styles: css,
  components: [
    WorkExperienceView,
    ProficiencyView
  ]
})
export default class HomeView extends BaseComponent {
  private imageParticle?: ImageParticle;

  public onInit(): void {
    this.setupParticles();
  }

  private setupParticles() {
    const container = this.shadow.querySelector<HTMLElement>(".image-particle-container");
    const canvas = this.shadow.querySelector<HTMLCanvasElement>("#particlesCanvas");
    const image = this.shadow.querySelector<HTMLImageElement>("#faceImage");

    if (!container || !canvas || !image) return;
    this.imageParticle = new ImageParticle(
      container,
      canvas,
      image,
      "/assets/musics/m1.mp3"
    );
  }

  public onDestroy(): void {
    this.imageParticle?.destroy();
    this.imageParticle = undefined;
  }
}
