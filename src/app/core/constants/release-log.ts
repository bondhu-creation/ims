// Release log shown on the public /release-log page. Keep the newest release
// first: it is the one shown expanded. Written for shop owners and staff:
// describe what changed for each role, not how.
export interface ReleaseLogItem {
  type: 'New' | 'Improved' | 'Fixed';
  title: string;
  description: string;
}

export interface ReleaseLog {
  date: string;
  overview: string;
  items: ReleaseLogItem[];
}

export const RELEASE_LOGS: ReleaseLog[] = [
  {
    date: '13 October 2026',
    overview:
      'A new Daily Sales Report shows everything sold on a day, item by item, and how much cash should be in the drawer, so whoever closes the shop can count the cash and check it against the Google Drive sheet before leaving.',
    items: [
      {
        type: 'New',
        title: 'Daily Sales Report for Salesman and Manager role',
        description:
          'Open Reports, choose Daily Sales Report under Sales Reports, pick the date and click Generate to download an Excel file. It covers the whole shop’s sales for the day, whichever salesman made them, and both roles get the same report, so owners can cross-check any day from the Manager account. Selling prices only, never purchase costs or profit.',
      },
      {
        type: 'New',
        title: 'Expected cash in drawer',
        description:
          'The Summary sheet shows invoices, items sold, discount, cash and bKash sales, refunds paid that day, and the Expected Cash in Drawer to count against. Item-wise, Invoice-wise and Returns sheets list every product, invoice line and refund for the day.',
      },
      {
        type: 'New',
        title: 'How the numbers are counted',
        description:
          'Only confirmed sales are counted, not drafts. A refund counts on the day the money was given back, so each day’s report matches that day’s drawer. Sales after midnight but before 6 AM count in the previous day’s report. If an invoice total does not match the products on it, the Summary lists it in red under Check.',
      },
    ],
  },
  {
    date: '25 September 2026',
    overview:
      'Salesman role can now see the shop’s stock and print barcode labels, labels print correctly on the sticker printer, and Manager role can print invoices from the invoice list.',
    items: [
      {
        type: 'New',
        title: 'Inventory view for Salesman role',
        description:
          'Salesman role can now see every product the shop stocks, how many are available, and each batch with its selling price and storage location. If the shelf count does not match the system, they can report it to Manager role right away. Purchase costs and profit remain visible to Manager role only.',
      },
      {
        type: 'New',
        title: 'Barcode labels for Salesman role',
        description:
          'Salesman role can generate and print a barcode label for any batch, so new stock can be labelled as soon as it arrives.',
      },
      {
        type: 'New',
        title: 'Batch code on purchase orders for Manager role',
        description:
          'Each verified purchase order now shows its batch code, so Manager role knows exactly which labels belong to the goods that just arrived.',
      },
      {
        type: 'Improved',
        title: 'Barcode label printing',
        description:
          'Labels now fit the sticker roll: one label per sticker, properly aligned, with long product names shortened neatly. Choose how many labels to print in the print window.',
      },
      {
        type: 'Fixed',
        title: 'Invoice printing for Manager role',
        description:
          'Manager role can now print any invoice from the Invoice list. It prints the same receipt Salesman role prints.',
      },
    ],
  },
];
