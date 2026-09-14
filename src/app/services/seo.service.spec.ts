import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let meta: { updateTag: ReturnType<typeof vi.fn> };
  let document: Document;

  beforeEach(() => {
    meta = { updateTag: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: Meta, useValue: meta }],
    });

    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);

    document
      .querySelectorAll('link[rel="canonical"]')
      .forEach((link) => link.remove());
  });

  it('updates the standard, og, and twitter meta tags', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
    });

    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'A description',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      property: 'og:title',
      content: 'A title',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      property: 'og:description',
      content: 'An og description',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'twitter:title',
      content: 'A title',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'twitter:description',
      content: 'An og description',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://example.com/page',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'twitter:url',
      content: 'https://example.com/page',
    });
  });

  it('defaults the robots tag when none is provided', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
    });

    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'robots',
      content:
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    });
  });

  it('uses the provided robots tag when given', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
      robots: 'noindex, nofollow',
    });

    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'robots',
      content: 'noindex, nofollow',
    });
  });

  it('only sets og:image and twitter:image when an image is provided', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
    });

    expect(meta.updateTag).not.toHaveBeenCalledWith(
      expect.objectContaining({ property: 'og:image' }),
    );

    meta.updateTag.mockClear();

    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
      ogImage: 'https://example.com/image.png',
    });

    expect(meta.updateTag).toHaveBeenCalledWith({
      property: 'og:image',
      content: 'https://example.com/image.png',
    });
    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'twitter:image',
      content: 'https://example.com/image.png',
    });
  });

  it('creates a canonical link tag when none exists', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/page',
    });

    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe('https://example.com/page');
  });

  it('reuses and updates an existing canonical link tag', () => {
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/first',
    });
    service.updateMetaTags({
      description: 'A description',
      ogTitle: 'A title',
      ogDescription: 'An og description',
      canonicalUrl: 'https://example.com/second',
    });

    const links = document.querySelectorAll('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('https://example.com/second');
  });
});
