export interface ContentItem {
  readonly id: number;
  user_id: string | null;
  data: { [key: string]: any };
}
