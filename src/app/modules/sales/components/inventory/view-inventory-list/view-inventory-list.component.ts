import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Constants } from '@app/core/constants/constants';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'view-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    NgZorroCustomModule,
    LoaderComponent,
    AngularSvgIconModule,
  ],
  templateUrl: './view-inventory-list.component.html',
  styleUrls: ['./view-inventory-list.component.scss'],
})
export class ViewInventoryListComponent {
  @Input() data: any[] = [];
  @Output() readonly actionEmitter: EventEmitter<object> = new EventEmitter();
  @Output() paginationEvent: EventEmitter<object> = new EventEmitter();
  @Input() loading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() resetPaginationEvent: EventEmitter<void> = new EventEmitter();

  currentIndex: number = 1;
  offset: number = 0;
  pageSize: number = Constants.PAGE_SIZE;

  ngOnInit(): void {
    this.resetPaginationEvent.subscribe(() => {
      this.currentIndex = 1;
      this.offset = 0;
      this.emitPagination();
    });
  }

  emitPagination(): void {
    this.paginationEvent.emit({ offset: this.offset, limit: this.pageSize });
  }

  onPageIndexChange(pageIndex: number): void {
    this.currentIndex = pageIndex;
    this.offset = (pageIndex - 1) * this.pageSize;
    this.paginationEvent.emit({ offset: this.offset, limit: this.pageSize });
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentIndex = 1;
    this.offset = 0;
    this.paginationEvent.emit({ offset: this.offset, limit: this.pageSize });
  }

  handleAction(action: any, value: any): any {
    this.actionEmitter.emit({ action, value });
  }

  getFirstLetter(name: any): any {
    return name[0];
  }

  getRestockThresholdStatus(item: any): boolean {
    if (item?.total_available_quantity < item?.restock_threshold) {
      return true;
    } else {
      return false;
    }
  }

  // Ready for Sale is the normal case, so the ribbon only flags the exceptions.
  showRibbon(item: any): boolean {
    return item.has_pending_pricing || !item.has_for_sale_batch;
  }

  getRibbonColor(item: any): any {
    if (item.has_pending_pricing) {
      return 'purple';
    }
    if (!item.has_pending_pricing && !item.has_for_sale_batch) {
      return '';
    }
    return 'green';
  }

  // Price of the in-stock for-sale batches: one value, or a range when batches differ.
  getPriceText(item: any): string {
    const min = item?.min_selling_price;
    const max = item?.max_selling_price;
    if (min === null || min === undefined) {
      return '-';
    }
    return min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  }

  getStatusText(hasPendingPricing: boolean, hasForSaleBatch: boolean): string {
    if (!hasForSaleBatch) {
      return 'Internal Use';
    }

    if (hasPendingPricing) {
      return 'Pending Pricing';
    }

    return 'Ready for Sale';
  }
}
