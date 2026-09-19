import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PrimaryButtonWithPlusIcon } from '@app/shared/components/buttons/primary-button-with-plus-icon/primary-button-with-plus-icon.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { Constants } from '@app/core/constants/constants';
import { DROPDOWN_OPTIONS } from '@app/core/constants/dropdown-options';
import { HttpService } from '@app/core/services/http.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';
import { ViewStockAdjustmentListComponent } from '@app/modules/manager/components/inventory/stock-adjustment/view-stock-adjustment-list/view-stock-adjustment-list.component';

@Component({
  selector: 'display-stock-adjustment-list',
  standalone: true,
  imports: [
    CommonModule,
    NgZorroCustomModule,
    ReactiveFormsModule,
    ViewStockAdjustmentListComponent,
    PrimaryButtonWithPlusIcon,
  ],
  templateUrl: './display-stock-adjustment-list.component.html',
  styleUrls: ['./display-stock-adjustment-list.component.scss'],
})
export class DisplayStockAdjustmentListComponent implements OnInit {
  data: any[] = [];
  totalCount: number = 0;
  loading: boolean = false;
  payload: any = {
    offset: 0,
    limit: Constants.PAGE_SIZE,
    search_text: '',
    adjustment_type: '',
  };
  isFilter: boolean = false;
  searchControl: FormControl = new FormControl('');
  selectControl: FormControl = new FormControl('');
  options = DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_TYPES;

  constructor(
    private _httpService: HttpService,
    private _destroyRef: DestroyRef,
    private _notificationService: NzNotificationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadList();
    this.searchControl.valueChanges.subscribe((value) => {
      this.onSearchChange(value);
    });
    this.selectControl.valueChanges.subscribe((value) => {
      this.onSelectChange(value);
    });
  }

  onSearchChange(value: string): void {
    this.payload = {
      ...this.payload,
      offset: 0,
      limit: Constants.PAGE_SIZE,
      search_text: value ?? '',
    };
    this.isFilter = true;
    this.loadList();
  }

  onSelectChange(value: string): void {
    this.payload = {
      ...this.payload,
      offset: 0,
      limit: Constants.PAGE_SIZE,
      adjustment_type: value ?? '',
    };
    this.isFilter = true;
    this.loadList();
  }

  handlePaginationEvent(event: any) {
    this.payload = {
      ...this.payload,
      offset: event.offset,
      limit: event.limit,
    };
    this.loadList();
  }

  loadList(): any {
    if (!this.isFilter) {
      this.loading = true;
    }
    this._httpService
      .get(APIEndpoint.GET_STOCK_ADJUSTMENT_LIST, this.payload)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.data = [];
            if (res.body?.data?.length) {
              this.data = res.body.data;
              this.totalCount = res.body.total;
            } else {
              this.data = [];
              this.totalCount = 0;
            }
          }
        },
        error: (err: any) => {
          console.log(err);
          this._notificationService.error('Error!', err?.error?.message);
        },
      });
  }

  handleListActions(event: any): any {
    if (event.action === 'create') {
      this.handleAdd();
    } else if (event.action === 'view') {
      this.handleView(event.value.oid);
    }
  }

  handleAdd(): any {
    this._router.navigate(['../create-stock-adjustment'], {
      relativeTo: this._activatedRoute,
    });
  }

  handleView(value: any): any {
    this._router.navigate([`../view-stock-adjustment/${value}`], {
      relativeTo: this._activatedRoute,
      state: { edit: false },
    });
  }
}
