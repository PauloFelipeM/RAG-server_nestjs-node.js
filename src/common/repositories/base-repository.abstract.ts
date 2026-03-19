export abstract class BaseRepository<T, CreateDto> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
