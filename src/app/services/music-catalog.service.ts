import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
import { Song } from '../interfaces/song';
import { parseSongs } from '../shared/parsers';

/** The songs, loaded once from `public/assets` and shared by every component that plays them. */
@Injectable({
  providedIn: 'root',
})
export class MusicCatalogService {
  private readonly musicResource = httpResource(
    () => '/assets/music-list.json',
    {
      parse: parseSongs,
    },
  );

  // `value()` throws while the resource is in its error state, so check `hasValue()` first.
  readonly songs = computed((): readonly Song[] =>
    this.musicResource.hasValue() ? this.musicResource.value() : [],
  );
  readonly isLoading = this.musicResource.isLoading;
  readonly hasLoadError = computed(
    () => this.musicResource.error() !== undefined,
  );

  reload(): void {
    this.musicResource.reload();
  }
}
