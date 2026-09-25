import { Injectable, signal } from '@angular/core';
import { COMPANY_INFO } from '../constants/company-info';
import { Constants } from '../constants/constants';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  isPrinting = signal(false);
  companyInfo = COMPANY_INFO;

  formatLocalTime(createdOn?: string): string {
    if (createdOn) {
      return createdOn.substring(0, 16).replace('T', ' ');
    } else {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      hours = hours % 12 || 12;

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  }

  printReceipt(data: any): Promise<void> {
    if (this.isPrinting()) return Promise.resolve();

    this.isPrinting.set(true);

    return new Promise((resolve) => {
      const receiptHTML = this.generateReceiptHTML(data, this.companyInfo);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Failed to open print window');
        this.isPrinting.set(false);
        resolve();
        return;
      }

      printWindow.document.open();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      const handlePrintCleanup = () => {
        printWindow.close();
        this.isPrinting.set(false);
        resolve();
      };

      // Safer: wait for printWindow to load completely
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();

            // Use event listener for reliable cleanup
            printWindow.onafterprint = handlePrintCleanup;

            // Fallback in case onafterprint is not called
            setTimeout(() => handlePrintCleanup(), 3000);
          } catch (err) {
            console.error('Printing failed', err);
            handlePrintCleanup();
          }
        }, 100); // Slight delay to ensure DOM is fully ready
      };
    });
  }

  private generateReceiptHTML(data: any, company_info: any): string {
    return `
    <html>
      <head>
        <style>
          @page {
            size: 58mm auto;
            margin: 0 0 5mm 0;
          }

          body {
            font-family: monospace;
            width: 58mm;
            padding: 5mm;
            font-size: 10px;
            margin: 0;
          }

          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .flex {
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="center bold">${company_info.name}</div>
        <div class="center">Invoice No: ${data.invoice_no}</div>
        <div class="center">
          Date: ${this.formatLocalTime(data.created_on)}
        </div>
        <div class="line"></div>

        ${data.products
          .map(
            (p: any) => `
          <div class="flex">
            <div>${p.product_name} x${p.quantity}</div>
            <div>${p.total.toFixed(2)}</div>
          </div>
        `
          )
          .join('')}

        <div class="line"></div>
        <div class="flex bold">
          <div>Total</div>
          <div>${data.total_amount.toFixed(2)} BDT</div>
        </div>

        <div style="height: 15mm;"></div>
        <div class="center">Thank you!</div>
        <div class="center">Powered by ${company_info.name}</div>
        <div class="center">${company_info.website}</div>
        </body>
    </html>
  `;
  }

  printBarcodes(barcodeData: any): Promise<void> {
    if (this.isPrinting()) return Promise.resolve();

    this.isPrinting.set(true);

    return new Promise((resolve) => {
      const barcodeHTML = this.generateBarcodeHTML(barcodeData);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        console.error('Failed to open print window');
        this.isPrinting.set(false);
        resolve();
        return;
      }

      printWindow.document.open();
      printWindow.document.write(barcodeHTML);
      printWindow.document.close();

      const handlePrintCleanup = () => {
        printWindow.close();
        this.isPrinting.set(false);
        resolve();
      };

      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = handlePrintCleanup;
            setTimeout(() => handlePrintCleanup(), 3000); // fallback
          } catch (err) {
            console.error('Printing failed', err);
            handlePrintCleanup();
          }
        }, 100);
      };
    });
  }

  // One sticker per page for a gap-sensing sticker printer: the page is exactly
  // the sticker size (Constants.BARCODE_LABEL_SIZE) and nothing may overflow it.
  // The barcode is stretched to the space left after the text lines, so the
  // same layout works if the roll size changes.
  private generateBarcodeHTML(data: any): string {
    const { width, height } = Constants.BARCODE_LABEL_SIZE;
    const escapeHTML = (value: any) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const hasPrice = data.price !== null && data.price !== undefined;

    return `
    <html>
      <head>
        <style>
          @page {
            size: ${width}mm ${height}mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: ${width}mm;
            height: ${height}mm;
            overflow: hidden;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            text-transform: uppercase;
            color: #000;
          }

          .label {
            width: ${width}mm;
            height: ${height}mm;
            padding: 1.5mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
          }

          .company {
            font-size: 7px;
            font-weight: bold;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .product {
            font-size: 9px;
            font-weight: bold;
            line-height: 1.15;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .barcode {
            flex: 1 1 auto;
            min-height: 0;
            max-height: ${(height * 0.35).toFixed(1)}mm;
            margin-top: 0.5mm;
          }

          .barcode svg {
            display: block;
            width: 100%;
            height: 100%;
          }

          .code {
            margin-top: 1mm;
            font-size: 7px;
            font-weight: bold;
            line-height: 1.2;
            letter-spacing: 0.5px;
          }

          .price {
            font-size: 10px;
            font-weight: bold;
            line-height: 1.2;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div class="label">
          <div class="company">${escapeHTML(data.companyName)}</div>
          <div class="product">${escapeHTML(data.productName)}</div>
          <div class="barcode"><svg id="barcode"></svg></div>
          <div class="code">${escapeHTML(data.batchCode)}</div>
          ${hasPrice ? `<div class="price">৳ ${Number(data.price).toFixed(2)}</div>` : ''}
        </div>

        <script>
          JsBarcode("#barcode", "${escapeHTML(data.batchCode)}", {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: false,
            margin: 0,
            // Blank quiet zone of 10 bar widths each side, so scanners find the edges.
            marginLeft: 20,
            marginRight: 20
          });
          // Scale the bars to the box: every bar grows by the same factor, so it stays scannable.
          var svg = document.getElementById("barcode");
          svg.setAttribute("viewBox", "0 0 " + svg.getAttribute("width").replace("px", "") + " " + svg.getAttribute("height").replace("px", ""));
          svg.setAttribute("preserveAspectRatio", "none");
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.removeAttribute("style");
        </script>
      </body>
    </html>
  `;
  }
}
