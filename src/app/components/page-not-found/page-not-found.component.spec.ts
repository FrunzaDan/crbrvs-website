import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoService } from '../../services/seo.service';
import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  let fixture: ComponentFixture<PageNotFoundComponent>;
  let seoService: { updateMetaTags: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    seoService = { updateMetaTags: vi.fn() };

    TestBed.configureTestingModule({
      imports: [PageNotFoundComponent],
      providers: [
        provideRouter([]),
        { provide: SeoService, useValue: seoService },
      ],
    });

    fixture = TestBed.createComponent(PageNotFoundComponent);
  });

  it('sets noindex 404 meta tags on init', () => {
    fixture.detectChanges();

    expect(seoService.updateMetaTags).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/404',
        robots: 'noindex, nofollow',
      }),
    );
  });
});
