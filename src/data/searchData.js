import { merchData } from '../components/Shop';
import { journalData } from '../components/Journal';
import { servicesData } from '../components/Services';
import { TOOL_SEARCH_DATA } from './searchCatalog';

const contentSearchData = [
  ...merchData.map((item) => ({ ...item, type: 'PRODUCT', tag: 'SHOP', id: `product-${item.id}`, kind: 'CONTENT', description: item.details, keywords: [item.color, ...(item.sizes || [])] })),
  ...journalData.map((item) => ({ ...item, type: 'JOURNAL', tag: 'JOURNAL', id: `journal-${item.id}`, kind: 'CONTENT', description: item.content, keywords: [item.date] })),
  ...servicesData.map((item) => ({ ...item, type: 'SERVICE', tag: 'SERVICES', id: `service-${item.label}`, kind: 'CONTENT', description: item.description, keywords: [item.label] }))
];

export const SEARCH_DATA = [...TOOL_SEARCH_DATA, ...contentSearchData];
