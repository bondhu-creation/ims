import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { HttpService } from '@app/core/services/http.service';
import { ReportFilterComponent } from '@app/modules/manager/components/report-filter/report-filter.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs';

@Component({
  selector: 'salesman-reports',
  imports: [
    CommonModule,
    TranslateModule,
    NgZorroCustomModule,
    ReportFilterComponent,
  ],
  templateUrl: './salesman-reports.component.html',
  styleUrl: './salesman-reports.component.scss'
})
export class SalesmanReportsComponent {
  reportGroupColumns: any;
  reportGroups = [
    {
      key: 'inventory',
      title: 'manager.report.inventory.title',
      expanded: false,
      sub_reports: [
        {
          key: 'current_stock_report',
          title:
            'manager.report.inventory.sub_reports.current_stock_report.title',
          description:
            'manager.report.inventory.sub_reports.current_stock_report.description',
          url: APIEndpoint.GET_CURRENT_STOCK_REPORT_FOR_SALESMAN,
          filters: ['warehouse_oid'],
          // filters: ['warehouse_oid', 'category_oid', 'sub_category_oid'],
        },
        {
          key: 'product_wise_stock_value',
          title:
            'manager.report.inventory.sub_reports.product_wise_stock_value.title',
          description:
            'manager.report.inventory.sub_reports.product_wise_stock_value.description',
          url: APIEndpoint.GET_PRODUCT_WISE_STOCK_REPORT_FOR_SALESMAN,
          filters: ['product_oid'],
        },
        // {
        //   key: 'low_stock_report',
        //   title: 'manager.report.inventory.sub_reports.low_stock_report.title',
        //   description:
        //     'manager.report.inventory.sub_reports.low_stock_report.description',
        //   url: APIEndpoint.GET_LOW_STOCK_REPORT,
        //   filters: ['warehouse_oid', 'category_oid', 'sub_category_oid'],
        // },
      ],
    },
  ];

  reportKey: string = '';

  isLoading: boolean = false;

  iframeSource!: any;
  iframeShow: boolean = false;
  notFound: boolean = false;

  private _selectedCache: any = null;

  ngOnInit(): void {
    this.getReportGroupColumns();
  }

  toggleGroup(group: any) {
    group.expanded = !group.expanded;
  }

  getReportGroupColumns(): void {
    let colCount = 3;

    const columns: any[][] = Array.from({ length: colCount }, () => []);
    this.reportGroups.forEach((group, i) => {
      columns[i % colCount].push(group);
    });

    this.reportGroupColumns = columns;
  }

  constructor(
    private _translateService: TranslateService,
    private _notificationService: NzNotificationService,
    private _httpService: HttpService,
    private _destroyRef: DestroyRef,
    private _sanitizer: DomSanitizer
  ) {}

  getSelectedReport(): any {
    if (!this._selectedCache || this._selectedCache.key !== this.reportKey) {
      this._selectedCache =
        this.reportGroups
          .flatMap((g) => g.sub_reports)
          .find((r) => r.key === this.reportKey) || null;
    }
    return this._selectedCache;
  }

  generateReportForm(key: string): any {
    this.reportKey = key;
  }

  handleCancel(): void {
    this.reportKey = '';
    this.iframeShow = false;
    this.notFound = false;
  }

  handleReportAction(action: any): void {
    if (action.action === 'cancel') {
      this.handleCancel();
    } else if (action.action === 'submit') {
      const report = this.getSelectedReport();
      if (report.url && report.url !== null) {
        this.getReport(report.url, action.value, report.key);
      } else {
        this._notificationService.info(
          this._translateService.instant('notification.title.info'),
          'This report is not available right now, we are working on it.'
        );
        this.handleCancel();
      }
    }
  }

  getReport(path: string, payload?: any, report_key?: string): void {
    this.isLoading = true;

    this._httpService
      .downloadFile(path, payload)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: any) => {
          const blob: Blob = res.body;
          if (!blob) {
            this._notificationService.info(
              this._translateService.instant('common.notification.title.info'),
              this._translateService.instant(
                'common.notification.no_data_found'
              )
            );
            return;
          }

          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, '0');
          const timestamp = `${pad(now.getDate())}${pad(
            now.getMonth() + 1
          )}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}`;

          const fileName = `${report_key}_${timestamp}.xlsx`;

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          if (err.status === 404) {
            this.notFound = true;
            this.iframeShow = false;
            this._notificationService.warning(
              this._translateService.instant(
                'common.notification.title.warning'
              ),
              this._translateService.instant(
                'common.notification.no_content_found_for_report'
              )
            );
            return;
          }
          this._notificationService.error(
            this._translateService.instant('common.notification.title.error'),
            this._translateService.instant(
              'common.notification.something_went_wrong'
            )
          );
        },
      });
  }
}