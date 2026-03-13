// Sample Commodities
export const COMMODITIES = [
  { id: 1, name: 'COVID-19 Test Kits', category: 'Diagnostics', unit: 'Box/25', price: 125.00, stock: 450 },
  { id: 2, name: 'Malaria RDT', category: 'Diagnostics', unit: 'Box/50', price: 85.00, stock: 320 },
  { id: 3, name: 'Laboratory Reagents', category: 'Reagents', unit: 'Liter', price: 210.00, stock: 45 },
  { id: 4, name: 'Specimen Collection Tubes', category: 'Supplies', unit: 'Pack/100', price: 45.00, stock: 890 },
  { id: 5, name: 'PPE Kits', category: 'Safety', unit: 'Kit', price: 35.00, stock: 1200 },
  { id: 6, name: 'Centrifuge Tubes', category: 'Supplies', unit: 'Pack/500', price: 78.00, stock: 156 },
  { id: 7, name: 'HIV Rapid Test', category: 'Diagnostics', unit: 'Box/100', price: 195.00, stock: 280 },
  { id: 8, name: 'Pipette Tips', category: 'Supplies', unit: 'Box/1000', price: 52.00, stock: 720 },
];

// Sample Orders
export const INITIAL_ORDERS = [
  {
    id: 'ORD-2024-001',
    country: 'Nigeria',
    items: [
      { commodity: COMMODITIES[0], qty: 50 },
      { commodity: COMMODITIES[4], qty: 100 }
    ],
    priority: 'High',
    status: 'Submitted',
    pateoRef: 'PATEO-NG-2024-0156',
    pateoFile: 'PATEO_Nigeria_Jan2024.pdf',
    date: '2024-01-15',
    notes: 'Urgent need for outbreak response',
    labReviewedBy: null,
    labReviewDate: null,
    oslApprovedBy: null,
    oslApproveDate: null
  },
  {
    id: 'ORD-2024-002',
    country: 'Kenya',
    items: [
      { commodity: COMMODITIES[1], qty: 30 },
      { commodity: COMMODITIES[2], qty: 10 }
    ],
    priority: 'Medium',
    status: 'Submitted',
    pateoRef: 'PATEO-KE-2024-0089',
    pateoFile: 'PATEO_Kenya_Jan2024.pdf',
    date: '2024-01-14',
    notes: 'Quarterly restock',
    labReviewedBy: null,
    labReviewDate: null,
    oslApprovedBy: null,
    oslApproveDate: null
  },
  {
    id: 'ORD-2024-003',
    country: 'Ghana',
    items: [{ commodity: COMMODITIES[6], qty: 20 }],
    priority: 'Low',
    status: 'Forwarded to OSL',
    pateoRef: 'PATEO-GH-2024-0034',
    pateoFile: 'PATEO_Ghana_Jan2024.pdf',
    date: '2024-01-12',
    notes: 'Standard order',
    labReviewedBy: 'Dr. Amara Osei',
    labReviewDate: '2024-01-13',
    oslApprovedBy: null,
    oslApproveDate: null
  },
  {
    id: 'ORD-2024-004',
    country: 'Nigeria',
    items: [
      { commodity: COMMODITIES[3], qty: 200 },
      { commodity: COMMODITIES[7], qty: 50 }
    ],
    priority: 'Medium',
    status: 'Forwarded to OSL',
    pateoRef: 'PATEO-NG-2024-0157',
    pateoFile: 'PATEO_Nigeria_Jan2024_2.pdf',
    date: '2024-01-10',
    notes: 'Lab expansion supplies',
    labReviewedBy: 'Dr. Amara Osei',
    labReviewDate: '2024-01-11',
    oslApprovedBy: null,
    oslApproveDate: null
  },
  {
    id: 'ORD-2024-005',
    country: 'South Africa',
    items: [{ commodity: COMMODITIES[0], qty: 100 }],
    priority: 'High',
    status: 'Approved',
    pateoRef: 'PATEO-ZA-2024-0201',
    pateoFile: 'PATEO_SouthAfrica_Jan2024.pdf',
    date: '2024-01-08',
    notes: 'Surge capacity',
    labReviewedBy: 'Dr. Kofi Mensah',
    labReviewDate: '2024-01-09',
    oslApprovedBy: 'Marie Laurent',
    oslApproveDate: '2024-01-10'
  },
  {
    id: 'ORD-2024-006',
    country: 'Kenya',
    items: [{ commodity: COMMODITIES[4], qty: 500 }],
    priority: 'Low',
    status: 'Shipped',
    pateoRef: 'PATEO-KE-2024-0088',
    pateoFile: 'PATEO_Kenya_Dec2023.pdf',
    date: '2024-01-05',
    notes: 'Annual PPE restock',
    labReviewedBy: 'Dr. Amara Osei',
    labReviewDate: '2024-01-06',
    oslApprovedBy: 'Jean Pierre',
    oslApproveDate: '2024-01-07',
    shipmentTracking: 'DHL-9876543210'
  },
];
