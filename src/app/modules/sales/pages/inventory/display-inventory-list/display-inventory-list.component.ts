import { Component, DestroyRef, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { Constants } from '@app/core/constants/constants';
import { HttpService } from '@app/core/services/http.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { ViewInventoryListComponent } from '@app/modules/sales/components/inventory/view-inventory-list/view-inventory-list.component';

@Component({
  selector: 'display-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    NgZorroCustomModule,
    ReactiveFormsModule,
    ViewInventoryListComponent,
  ],
  templateUrl: './display-inventory-list.component.html',
  styleUrls: ['./display-inventory-list.component.scss'],
})
export class DisplayInventoryListComponent implements OnInit {
  data: any[] = [];
  totalCount: number = 0;
  loading: boolean = false;
  payload: any = {
    offset: 0,
    limit: Constants.PAGE_SIZE,
    search_text: '',
  };
  isFilter: boolean = false;
  searchControl: FormControl = new FormControl('');

  resetChildPageEvent: EventEmitter<void> = new EventEmitter();

  constructor(
    private _httpService: HttpService,
    private _destroyRef: DestroyRef,
    private _notificationService: NzNotificationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadList();
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((value) => {
        this.onSearchChange(value);
      });
  }

  // Resetting the child pager emits a pagination event, which reloads the list from page 1.
  onSearchChange(value: string): void {
    this.payload = { ...this.payload, search_text: value };
    this.isFilter = true;
    this.resetChildPageEvent.emit();
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
      .get(APIEndpoint.GET_PRODUCT_LIST_FOR_SALESMAN_INVENTORY, this.payload)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            this.data = res.body?.data ?? [];
            this.totalCount = Number(res.body?.total ?? 0);
          }
        },
        error: (err: any) => {
          console.log(err);
          this._notificationService.error('Error!', err?.error?.message);
        },
      });
  }

  handleListActions(event: any): any {
    if (event.action === 'view') {
      this.handleView(event.value.product_oid);
    }
  }

  handleView(value: any): any {
    this._router.navigate([`../view-product/${value}`], {
      relativeTo: this._activatedRoute,
    });
  }
}
