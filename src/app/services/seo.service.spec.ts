import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { SeoService, SITE_URL } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  const metaContent = (selector: string) =>
    document.head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  const canonicalLinks = () =>
    document.head.querySelectorAll('link[rel="canonical"]');

  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"], meta[name], meta[property]')
      .forEach((element) => element.remove());

    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  it('sets the description and the social tags from the page title', () => {
    TestBed.inject(Title).setTitle('404 - CRBRVS Rap Hive');
    service.updateMetaTags({
      description: 'The page does not exist.',
      path: '/404',
    });

    expect(metaContent('name="description"')).toBe('The page does not exist.');
    expect(metaContent('property="og:title"')).toBe('404 - CRBRVS Rap Hive');
    expect(metaContent('property="og:description"')).toBe(
      'The page does not exist.',
    );
    expect(metaContent('property="og:url"')).toBe(`${SITE_URL}/404`);
    expect(metaContent('name="twitter:url"')).toBe(`${SITE_URL}/404`);
  });

  it('lets search engines index pages unless told otherwise', () => {
    service.updateMetaTags({ description: 'Home', path: '/' });
    expect(metaContent('name="robots"')).toContain('index, follow');

    service.updateMetaTags({
      description: '404',
      path: '/404',
      robots: 'noindex, nofollow',
    });
    expect(metaContent('name="robots"')).toBe('noindex, nofollow');
  });

  it('uses the English locale unless given another one', () => {
    service.updateMetaTags({ description: 'Home', path: '/' });
    expect(metaContent('property="og:locale"')).toBe('en_US');
  });

  it('sets a preview image only for pages that have one', () => {
    service.updateMetaTags({ description: 'Home', path: '/' });
    expect(metaContent('property="og:image"')).toBeUndefined();

    service.updateMetaTags({
      description: 'Home',
      path: '/',
      image: '/assets/images/crbrvs_logo.png',
    });
    expect(metaContent('property="og:image"')).toBe(
      `${SITE_URL}/assets/images/crbrvs_logo.png`,
    );
    expect(metaContent('name="twitter:image"')).toBe(
      `${SITE_URL}/assets/images/crbrvs_logo.png`,
    );
  });

  it('reuses one canonical link and drops the trailing slash for the home page', () => {
    service.updateMetaTags({ description: '404', path: '/404' });
    service.updateMetaTags({ description: 'Home', path: '/' });

    expect(canonicalLinks().length).toBe(1);
    expect(canonicalLinks()[0].getAttribute('href')).toBe(SITE_URL);
  });
});
