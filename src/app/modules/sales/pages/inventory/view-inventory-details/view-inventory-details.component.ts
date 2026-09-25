import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpService } from '@app/core/services/http.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { finalize } from 'rxjs';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { SecondaryButton } from '@app/shared/components/buttons/secondary-button/secondary-button.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { PrimaryButton } from '@app/shared/components/buttons/primary-button/primary-button.component';
import { PrintService } from '@app/core/services/print.service';
import { COMPANY_INFO } from '@app/core/constants/company-info';

// Read-only batch view for salesmen: stock per batch and barcode label printing.
// Pricing and stock adjustment stay with the manager's Inventory Overview.
@Component({
  selector: 'view-inventory-details',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    SecondaryButton,
    AngularSvgIconModule,
    NgZorroCustomModule,
    NgxBarcode6Module,
    PrimaryButton,
  ],
  templateUrl: './view-inventory-details.component.html',
  styleUrls: ['./view-inventory-details.component.scss'],
})
export class ViewInventoryDetailsComponent implements OnInit {
  @Input() oid: any;
  loading: boolean = false;
  productDetails: any;
  batch_data: any[] = [];

  isBarcodeDrawerVisible = false;
  barcodePreviewData: {
    productName: string;
    batchCode: string;
    companyName: string;
    price: number | null;
    quantityAvailable: number;
  } | null = null;

  constructor(
    private _httpService: HttpService,
    private _destroyRef: DestroyRef,
    private _notificationService: NzNotificationService,
    private _location: Location,
    private _printService: PrintService
  ) {}

  ngOnInit(): void {
    this.loadItemDetails();
  }

  goBack(): void {
    this._location.back();
  }

  loadItemDetails(): void {
    this.loading = true;
    this._httpService
      .get(APIEndpoint.GET_PRODUCT_DETAILS_FOR_SALESMAN_INVENTORY, {
        product_oid: this.oid,
      })
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.productDetails = res?.body?.data;
            this.batch_data = res?.body?.data?.batch_data ?? [];
          }
        },
        error: (err: any) => {
          console.log(err);
          this._notificationService.error('Error!', err?.error?.message);
        },
      });
  }

  generateBarcode(item: any): void {
    const showPrice = item.intended_use === 'for_sale';

    if (showPrice && !item.selling_price) {
      this._notificationService.warning(
        'Missing Price',
        'Cannot generate barcode: Selling price is missing.'
      );
      return;
    }

    this.barcodePreviewData = {
      productName: this.productDetails?.name,
      batchCode: item.batch_code,
      companyName: COMPANY_INFO.name,
      price: showPrice ? item.selling_price : null,
      quantityAvailable: item.quantity_available,
    };

    this.isBarcodeDrawerVisible = true;
  }

  printBarcode(): void {
    if (!this.barcodePreviewData) return;
    this._printService.printBarcodes(this.barcodePreviewData);
  }

  // Ready for Sale is the normal case, so the ribbon only flags the exceptions.
  showRibbon(item: any): boolean {
    return item.status !== 'ready_for_sale';
  }

  getRibbonColor(item: any): any {
    if (item.status === 'internal_use') {
      return '';
    } else if (item.status === 'ready_for_sale') {
      return 'green';
    } else if (item.status === 'pending_pricing') {
      return 'purple';
    }
  }

  getStatusText(status: string | null): string {
    if (status === 'internal_use') {
      return 'Internal Use';
    } else if (status === 'ready_for_sale') {
      return 'Ready for Sale';
    } else if (status === 'pending_pricing') {
      return 'Pending Pricing';
    }
    return 'Unknown Status';
  }

  closeDrawer(): void {
    this.isBarcodeDrawerVisible = false;
  }
}
