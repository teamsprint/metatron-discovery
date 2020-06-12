export class Page {
  page: number;
  size: number;
  sort: string;
  column: string;
}

export class PageResult {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
