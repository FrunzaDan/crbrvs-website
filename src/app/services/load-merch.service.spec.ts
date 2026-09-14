import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoadMerchService } from './load-merch.service';

describe('LoadMerchService', () => {
  let service: LoadMerchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadMerchService);
  });

  it('loads a non-empty list of merch items shaped like MerchItem', () => {
    const merch = service.loadMerch();

    expect(Array.isArray(merch)).toBe(true);
    expect(merch.length).toBeGreaterThan(0);

    for (const item of merch) {
      expect(typeof item.id).toBe('number');
      expect(typeof item.title).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(typeof item.src).toBe('string');
      expect(typeof item.description).toBe('string');
    }
  });

  it('has unique item ids', () => {
    const merch = service.loadMerch();
    const ids = merch.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
