import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { MerchItem } from '../interfaces/merch-item';
import { parseMerchItems } from '../shared/parsers';

/** The merch items, loaded once from `public/assets` and shared by every component that shows them. */
@Injectable({
  providedIn: 'root',
})
export class MerchCatalogService {
  private readonly merchResource = httpResource(
    () => '/assets/merch-list.json',
    {
      parse: parseMerchItems,
    },
  );

  // `value()` throws while the resource is in its error state, so check `hasValue()` first.
  readonly items = computed((): readonly MerchItem[] =>
    this.merchResource.hasValue() ? this.merchResource.value() : [],
  );
  readonly isLoading = this.merchResource.isLoading;
  readonly hasLoadError = computed(
    () => this.merchResource.error() !== undefined,
  );

  reload(): void {
    this.merchResource.reload();
  }
}
