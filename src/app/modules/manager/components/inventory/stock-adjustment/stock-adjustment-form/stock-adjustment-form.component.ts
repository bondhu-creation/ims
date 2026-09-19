import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PrimaryButton } from '@app/shared/components/buttons/primary-button/primary-button.component';
import { SecondaryButton } from '@app/shared/components/buttons/secondary-button/secondary-button.component';
import { NgZorroCustomModule } from '@app/shared/ng-zorro-custom.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APIEndpoint } from '@app/core/constants/api-endpoint';
import { DROPDOWN_OPTIONS } from '@app/core/constants/dropdown-options';
import {
  markFormGroupTouched,
  checkRequiredValidator,
} from '@app/core/constants/helper';
import { HttpService } from '@app/core/services/http.service';
import { ConfirmationModalComponent } from '@app/shared/components/confirmation-modal/confirmation-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'stock-adjustment-form',
  standalone: true,
  imports: [
    CommonModule,
    NgZorroCustomModule,
    ReactiveFormsModule,
    PrimaryButton,
    SecondaryButton,
  ],
  templateUrl: './stock-adjustment-form.component.html',
  styleUrls: ['./stock-adjustment-form.component.scss'],
})
export class StockAdjustmentFormComponent implements OnInit {
  @Output() readonly actionEmitter: EventEmitter<object> = new EventEmitter();
  @Input() formData: any;
  @Input() loading: boolean = false;
  form!: FormGroup;

  batchList: any[] = [];
  adjustmentTypes: any[] = DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_TYPES;
  selectedBatch: any = null;

  constructor(
    private _fb: FormBuilder,
    private _modal: NzModalService,
    private _httpService: HttpService,
    private _destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.form = this.createForm();
    this.loadBatchList();

    if (this.formData) {
      this.form.patchValue(this.formData);
    }

    // The batch is keyed on inventory_oid, not product_oid: a product can hold
    // several batches and the adjustment applies to exactly one of them.
    this.form
      .get('inventory_oid')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((inventoryOid: any) => {
        this.selectedBatch = this.batchList.find(
          (item) => item.inventory_oid === inventoryOid
        );
        this.form.patchValue(
          {
            available_quantity: this.selectedBatch?.quantity_available ?? 0,
            product_oid: this.selectedBatch?.product_oid ?? null,
          },
          { emitEvent: false }
        );
        this.form.get('quantity')?.updateValueAndValidity();
      });

    // Reasons differ by direction, so a stale reason must not survive a switch.
    this.form
      .get('adjustment_type')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.form.get('reason')?.reset(null);
        this.form.get('quantity')?.updateValueAndValidity();
      });
  }

  createForm(): FormGroup {
    return this._fb.group({
      product_oid: [null],
      inventory_oid: [null, [Validators.required]],
      available_quantity: [{ value: 0, disabled: true }],
      adjustment_type: ['increase', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      reason: [null, [Validators.required]],
      notes: [null],
    });
  }

  get isDecrease(): boolean {
    return this.form?.get('adjustment_type')?.value === 'decrease';
  }

  get reasonList(): any[] {
    return this.isDecrease
      ? DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_DECREASE_REASONS
      : DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_INCREASE_REASONS;
  }

  // Only a decrease is capped, and only once a batch is chosen. An increase is
  // unbounded, which is why the dispose form's fixed nzMax is not reused here.
  get maxQuantity(): number | null {
    if (!this.isDecrease) return null;
    return this.selectedBatch?.quantity_available ?? 0;
  }

  get resultingQuantity(): number | null {
    if (!this.selectedBatch) return null;
    const quantity = Number(this.form.get('quantity')?.value);
    if (!quantity || quantity <= 0) return null;
    const current = Number(this.selectedBatch.quantity_available);
    return this.isDecrease ? current - quantity : current + quantity;
  }

  getResultingQuantityText(): string {
    if (!this.selectedBatch) {
      return 'Select a batch to see what its stock will become.';
    }
    const resulting = this.resultingQuantity;
    if (resulting === null) {
      return 'Enter a quantity to see what this batch will become.';
    }
    const unit = this.selectedBatch.unit_type ?? '';
    return `Batch ${this.selectedBatch.batch_code} will go from ${this.selectedBatch.quantity_available} to ${resulting} ${unit}`.trim();
  }

  isOverDrawing(): boolean {
    const resulting = this.resultingQuantity;
    return resulting !== null && resulting < 0;
  }

  handleConfirm(): void {
    const type = this.isDecrease ? 'decrease' : 'increase';
    const message = `This will ${type} batch ${this.selectedBatch?.batch_code} to ${this.resultingQuantity} immediately. Continue?`;
    this._modal.create({
      nzContent: ConfirmationModalComponent,
      nzData: {
        message,
      },
      nzFooter: null,
      nzClosable: false,
      nzOnOk: () =>
        this.actionEmitter.emit({ action: 'submit', value: this.buildPayload() }),
    });
  }

  buildPayload(): any {
    const value = this.form.value;
    return {
      product_oid: value.product_oid,
      inventory_oid: value.inventory_oid,
      adjustment_type: value.adjustment_type,
      quantity: Number(value.quantity),
      reason: value.reason,
      notes: value.notes,
    };
  }

  handleForm(): void {
    if (this.form.valid && !this.isOverDrawing()) {
      this.handleConfirm();
    } else {
      markFormGroupTouched(this.form);
    }
  }

  goBack(): void {
    this.actionEmitter.emit({ action: 'back', value: this.form.value });
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? checkRequiredValidator(control) : false;
  }

  loadBatchList(): void {
    this._httpService
      .get(APIEndpoint.GET_BATCH_LIST_FOR_ADJUSTMENT_DROPDOWN)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.batchList = res?.body?.data ?? [];
        },
        error: (err: any) => {
          console.error(err);
        },
      });
  }
}
