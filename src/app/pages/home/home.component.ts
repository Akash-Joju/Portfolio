import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegacyScriptsService } from '../../services/legacy-scripts.service';
import { HeroComponent } from '../../components/hero/hero.component';
import { DirectorsNoteComponent } from '../../components/directors-note/directors-note.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterNavComponent } from '../../components/footer/footer.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { SectionBackgroundComponent } from '../../components/section-background/section-background.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    DirectorsNoteComponent,
    NavbarComponent,
    FooterNavComponent,
    StatsComponent,
    SectionBackgroundComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ["../../../assets/css/style.css"],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly scripts = [
    "/assets/js/services.js",
    "/assets/js/reveal.js",
    "/assets/js/contact.js"
  ];

  constructor(private legacyScripts: LegacyScriptsService) {}

  ngAfterViewInit(): void {
    this.legacyScripts.load(this.scripts);
  }

  ngOnDestroy(): void {
    this.legacyScripts.unload();

  }
}