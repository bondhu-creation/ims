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
