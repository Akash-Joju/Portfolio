import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    ReactiveFormsModule,
    HeroComponent,
    DirectorsNoteComponent,
    NavbarComponent,
    FooterNavComponent,
    StatsComponent,
    SectionBackgroundComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: [
    '../../../assets/css/style.css',
    './home.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  /** Endpoint of your Express backend */
  private readonly API_URL = 'https://portfolio-backend-1-k4ql.onrender.com/api/contacts';

  /** Legacy scripts — contact.js has been removed */
  private readonly scripts = [
    '/assets/js/services.js',
    '/assets/js/reveal.js',
  ];

  /** Reactive contact form */
  contactForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(120)],
    ],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[+\d][\d\s\-()]{6,19}$/),
      ],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(1000),
      ],
    ],
  });

  submitting = false;
  status = '';
  statusType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private legacyScripts: LegacyScriptsService
  ) {}

  /** Convenience getters used by the template */
  get emailCtrl() { return this.contactForm.get('email'); }
  get phoneCtrl() { return this.contactForm.get('phone'); }
  get descCtrl()  { return this.contactForm.get('description'); }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid || this.submitting) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.status = '';
    this.statusType = '';

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.contactForm.value),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        this.status = data?.message || 'Message sent. Thank you!';
        this.statusType = 'success';
        this.contactForm.reset();
      } else {
        this.status =
          data?.message || 'Something went wrong. Please try again.';
        this.statusType = 'error';
      }
    } catch {
      this.status = 'Network error. Please try again later.';
      this.statusType = 'error';
    } finally {
      this.submitting = false;
    }
  }

  ngAfterViewInit(): void {
    this.legacyScripts.load(this.scripts);
  }

  ngOnDestroy(): void {
    this.legacyScripts.unload();
  }
}