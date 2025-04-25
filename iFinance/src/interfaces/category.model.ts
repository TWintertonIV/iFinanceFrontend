export default interface Category {
  group_name: string;
  group_id?: number;
  category?: string;
  category_id?: number;
  parent?: string;
  children: Category[];
}