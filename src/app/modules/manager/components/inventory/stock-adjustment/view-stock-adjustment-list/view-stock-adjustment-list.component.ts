import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { Constants } from '@app/core/constants/constants';
import { DROPDOWN_OPTIONS } from '@app/core/constants/dropdown-options';

@Component({
  selector: 'view-stock-adjustment-list',
  standalone: true,
  imports: [CommonModule, NgZorroCustomModule, LoaderComponent],
  templateUrl: './view-stock-adjustment-list.component.html',
  styleUrls: ['./view-stock-adjustment-list.component.scss'],
})
export class ViewStockAdjustmentListComponent {
  @Input() data: any[] = [];
  @Output() readonly actionEmitter: EventEmitter<object> = new EventEmitter();
  @Output() paginationEvent: EventEmitter<object> = new EventEmitter();
  @Input() loading: boolean = false;
  @Input() totalCount: number = 0;

  currentIndex: number = 1;
  offset: number = 0;
  pageSize: number = Constants.PAGE_SIZE;

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

  isIncrease(item: any): boolean {
    return item?.adjustment_type === 'increase';
  }

  getTypeLabel(item: any): string {
    return this.isIncrease(item) ? 'Increase' : 'Decrease';
  }

  getSignedQuantity(item: any): string {
    return `${this.isIncrease(item) ? '+' : '-'}${item?.quantity}`;
  }

  getReasonLabel(item: any): string {
    const list = this.isIncrease(item)
      ? DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_INCREASE_REASONS
      : DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_DECREASE_REASONS;
    return list.find((r) => r.value === item?.reason)?.label || item?.reason;
  }
}
