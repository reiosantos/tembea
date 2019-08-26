
export interface IModelService<T, TId> {
  findById(id: TId): Promise<T>;
  findAll(filter: object): Promise<T[]>;
}
