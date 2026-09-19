import { Component, Inject, OnInit } from '@angular/core';
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
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { DROPDOWN_OPTIONS } from '@app/core/constants/dropdown-options';
import {
  checkRequiredValidator,
  markFormGroupTouched,
} from '@app/core/constants/helper';

export interface StockAdjustmentModalData {
  inventory_oid: string;
  product_oid: string;
  batch_code: string;
  quantity_available: number;
  unit_type?: string;
}

@Component({
  selector: 'app-stock-adjustment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgZorroCustomModule,
    PrimaryButton,
    SecondaryButton,
  ],
  templateUrl: './stock-adjustment-modal.component.html',
  styleUrls: ['./stock-adjustment-modal.component.scss'],
})
export class StockAdjustmentModalComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  adjustmentTypes: any[] = DROPDOWN_OPTIONS.STOCK_ADJUSTMENT_TYPES;

  constructor(
    @Inject(NZ_MODAL_DATA) public modalData: StockAdjustmentModalData,
    private _modalRef: NzModalRef,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.createForm();

    if (!this.modalData) {
      this.closeModal();
      return;
    }

    this.form.get('adjustment_type')?.valueChanges.subscribe(() => {
      this.form.get('reason')?.reset(null);
    });
  }

  createForm(): FormGroup {
    return this._fb.group({
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

  get maxQuantity(): number {
    return this.isDecrease ? this.modalData?.quantity_available ?? 0 : 999999999;
  }

  get resultingQuantity(): number | null {
    const quantity = Number(this.form?.get('quantity')?.value);
    if (!quantity || quantity <= 0) return null;
    const current = Number(this.modalData?.quantity_available);
    return this.isDecrease ? current - quantity : current + quantity;
  }

  getResultingQuantityText(): string {
    const resulting = this.resultingQuantity;
    if (resulting === null) {
      return `Batch <strong>${this.modalData?.batch_code}</strong> currently holds <strong>${this.modalData?.quantity_available}</strong>.`;
    }
    return `Batch <strong>${this.modalData?.batch_code}</strong> will go from <strong>${this.modalData?.quantity_available}</strong> to <strong>${resulting}</strong>.`;
  }

  isOverDrawing(): boolean {
    const resulting = this.resultingQuantity;
    return resulting !== null && resulting < 0;
  }

  handleForm(): void {
    if (this.form.valid && !this.isOverDrawing()) {
      this._modalRef.destroy({
        inventory_oid: this.modalData.inventory_oid,
        product_oid: this.modalData.product_oid,
        adjustment_type: this.form.value.adjustment_type,
        quantity: Number(this.form.value.quantity),
        reason: this.form.value.reason,
        notes: this.form.value.notes,
      });
    } else {
      markFormGroupTouched(this.form);
    }
  }

  closeModal(): void {
    this._modalRef.destroy();
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control ? checkRequiredValidator(control) : false;
  }
}
