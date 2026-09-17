import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MerchItem } from '../../interfaces/merch-item';
import { LoadMerchService } from '../../services/load-merch.service';
import { ScrollerService } from '../../services/scroller.service';

@Component({
  selector: 'app-merch',
  imports: [NgOptimizedImage],
  templateUrl: './merch.component.html',
  styleUrl: './merch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchComponent implements OnInit {
  private readonly loadMerchService = inject(LoadMerchService);
  readonly scrollerService = inject(ScrollerService);

  readonly merchScrollContainer = viewChild<ElementRef>('merchScrollContainer');

  merchItems = signal<MerchItem[]>([]);
  selectedMerchItem = signal<MerchItem | null>(null);
  isMerchModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const loadedSongs = this.loadMerchService.loadMerch();
    this.merchItems.set(loadedSongs);
  }

  scrollLeft(): void {
    const merchScrollContainer = this.merchScrollContainer();
    if (merchScrollContainer) {
      this.scrollerService.scrollToLeft(merchScrollContainer.nativeElement);
    }
  }

  scrollRight(): void {
    const merchScrollContainer = this.merchScrollContainer();
    if (merchScrollContainer) {
      this.scrollerService.scrollToRight(merchScrollContainer.nativeElement);
    }
  }

  openMerchItemModal(merchItem: MerchItem): void {
    this.isMerchModalOpen.set(true);
    this.selectedMerchItem.set(merchItem);
  }

  closeMerchItemModal(): void {
    this.isMerchModalOpen.set(false);
    this.selectedMerchItem.set(null);
  }
}
