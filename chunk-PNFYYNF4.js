import{a as c}from"./chunk-JVXDGBWL.js";import{Ta as d,la as a}from"./chunk-R43CV2CS.js";var l={name:"Bondhu Sports Plus",address:"Sherpur Road, Colony, Bogra.",phone:"+1 (555) 123-4567",email:"info@bondhusports.com",website:"www.bondhusports.com"};var b=(()=>{class s{constructor(){this.isPrinting=d(!1),this.companyInfo=l}formatLocalTime(i){if(i)return i.substring(0,16).replace("T"," ");{let t=new Date,o=String(t.getDate()).padStart(2,"0"),e=String(t.getMonth()+1).padStart(2,"0"),n=t.getFullYear(),r=t.getHours(),m=String(t.getMinutes()).padStart(2,"0");return r=r%12||12,`${o}/${e}/${n} ${r}:${m}`}}printReceipt(i){return this.isPrinting()?Promise.resolve():(this.isPrinting.set(!0),new Promise(t=>{let o=this.generateReceiptHTML(i,this.companyInfo),e=window.open("","_blank");if(!e){console.error("Failed to open print window"),this.isPrinting.set(!1),t();return}e.document.open(),e.document.write(o),e.document.close();let n=()=>{e.close(),this.isPrinting.set(!1),t()};e.onload=()=>{setTimeout(()=>{try{e.focus(),e.print(),e.onafterprint=n,setTimeout(()=>n(),3e3)}catch(r){console.error("Printing failed",r),n()}},100)}}))}generateReceiptHTML(i,t){return`
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
        <div class="center bold">${t.name}</div>
        <div class="center">Invoice No: ${i.invoice_no}</div>
        <div class="center">
          Date: ${this.formatLocalTime(i.created_on)}
        </div>
        <div class="line"></div>

        ${i.products.map(o=>`
          <div class="flex">
            <div>${o.product_name} x${o.quantity}</div>
            <div>${o.total.toFixed(2)}</div>
          </div>
        `).join("")}

        <div class="line"></div>
        <div class="flex bold">
          <div>Total</div>
          <div>${i.total_amount.toFixed(2)} BDT</div>
        </div>

        <div style="height: 15mm;"></div>
        <div class="center">Thank you!</div>
        <div class="center">Powered by ${t.name}</div>
        <div class="center">${t.website}</div>
        </body>
    </html>
  `}printBarcodes(i){return this.isPrinting()?Promise.resolve():(this.isPrinting.set(!0),new Promise(t=>{let o=this.generateBarcodeHTML(i),e=window.open("","_blank");if(!e){console.error("Failed to open print window"),this.isPrinting.set(!1),t();return}e.document.open(),e.document.write(o),e.document.close();let n=()=>{e.close(),this.isPrinting.set(!1),t()};e.onload=()=>{setTimeout(()=>{try{e.focus(),e.print(),e.onafterprint=n,setTimeout(()=>n(),3e3)}catch(r){console.error("Printing failed",r),n()}},100)}}))}generateBarcodeHTML(i){let{width:t,height:o}=c.BARCODE_LABEL_SIZE,e=r=>String(r??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),n=i.price!==null&&i.price!==void 0;return`
    <html>
      <head>
        <style>
          @page {
            size: ${t}mm ${o}mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: ${t}mm;
            height: ${o}mm;
            overflow: hidden;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
            text-transform: uppercase;
            color: #000;
          }

          .label {
            width: ${t}mm;
            height: ${o}mm;
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
            max-height: ${(o*.35).toFixed(1)}mm;
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
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
      </head>
      <body>
        <div class="label">
          <div class="company">${e(i.companyName)}</div>
          <div class="product">${e(i.productName)}</div>
          <div class="barcode"><svg id="barcode"></svg></div>
          <div class="code">${e(i.batchCode)}</div>
          ${n?`<div class="price">\u09F3 ${Number(i.price).toFixed(2)}</div>`:""}
        </div>

        <script>
          JsBarcode("#barcode", "${e(i.batchCode)}", {
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
        <\/script>
      </body>
    </html>
  `}static{this.\u0275fac=function(t){return new(t||s)}}static{this.\u0275prov=a({token:s,factory:s.\u0275fac,providedIn:"root"})}}return s})();export{l as a,b};
