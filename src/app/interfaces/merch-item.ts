/** A merch product. The price is in RON; `width` and `height` are the picture's size in pixels. */
export interface MerchItem {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly description: string;
}
