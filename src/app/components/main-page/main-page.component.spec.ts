import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoService } from '../../services/seo.service';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
  let fixture: ComponentFixture<MainPageComponent>;
  let seoService: { updateMetaTags: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    seoService = { updateMetaTags: vi.fn() };

    TestBed.configureTestingModule({
      imports: [MainPageComponent],
      providers: [{ provide: SeoService, useValue: seoService }],
      schemas: [NO_ERRORS_SCHEMA],
    });
    // Child components (navbar, music, merch, contact, footer, back-to-top)
    // have their own dedicated specs; this test only cares about the SEO
    // wiring, so their tags are left unresolved via NO_ERRORS_SCHEMA.
    TestBed.overrideComponent(MainPageComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });

    fixture = TestBed.createComponent(MainPageComponent);
  });

  it('sets the homepage meta tags on init', () => {
    fixture.detectChanges();

    expect(seoService.updateMetaTags).toHaveBeenCalledWith(
      expect.objectContaining({
        ogTitle: 'CRBRVS Rap Hive',
        canonicalUrl: 'https://crbrvsraphive.com',
        ogImage: 'https://crbrvsraphive.com/assets/images/crbrvs_logo.png',
      }),
    );
  });
});
