import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SecondaryButton } from '@app/shared/components/buttons/secondary-button/secondary-button.component';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { DROPDOWN_OPTIONS } from '@app/core/constants/dropdown-options';
import { HttpService } from '@app/core/services/http.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';

@Component({
  selector: 'view-stock-adjustment-details',
  standalone: true,
  imports: [CommonModule, LoaderComponent, SecondaryButton, NgZorroCustomModule],
  templateUrl: './view-stock-adjustment-details.component.html',
  styleUrls: ['./view-stock-adjustment-details.component.scss'],
})
export class ViewStockAdjustmentDetailsComponent implements OnInit {
  @Input() oid: any;
  loading: boolean = false;
  adjustmentDetails: any;

  constructor(
    private _httpService: HttpService,
    private _destroyRef: DestroyRef,
    private _notificationService: NzNotificationService,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this.loadStockAdjustmentDetails();
  }

  goBack(): void {
    this._location.back();
  }

  get isIncrease(): boolean {
    return this.adjustmentDetails?.adjustment_type === 'increase';
  }

  getTypeLabel(): string {
    return this.isIncrease ? 'Increase' : 'Decrease';
  }

  getSignedQuantity(): string {
    return `${this.isIncrease ? '+' : '-'}${this.adjustmentDetails?.quantity}`;
  }

  getReasonLabel(): string {
    const list = this.isIncrease
      ? DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_INCREASE_REASONS
      : DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_DECREASE_REASONS;
    return (
      list.find((r) => r.value === this.adjustmentDetails?.reason)?.label ||
      this.adjustmentDetails?.reason
    );
  }

  // The batch may have moved on since this adjustment (a later sale, return or
  // another adjustment), so it is worth showing both figures side by side.
  hasMovedSince(): boolean {
    if (!this.adjustmentDetails) return false;
    return (
      Number(this.adjustmentDetails.current_quantity_available) !==
      Number(this.adjustmentDetails.quantity_after)
    );
  }

  loadStockAdjustmentDetails(): void {
    this.loading = true;
    this._httpService
      .get(APIEndpoint.GET_STOCK_ADJUSTMENT_DETAILS, { oid: this.oid })
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.adjustmentDetails = res?.body?.data;
          }
        },
        error: (err: any) => {
          console.log(err);
          this._notificationService.error('Error!', err?.error?.message);
        },
      });
  }
}
