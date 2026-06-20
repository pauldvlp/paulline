const NOT_IMPLEMENTED_MESSAGE = 'PaulineClient resource methods are not implemented yet.';

export class ResourceClient<TRecord, TCreateInput, TUpdateInput> {
  constructor(
    private readonly baseUrl: string,
    private readonly resourcePath: string,
  ) {}

  list(): Promise<TRecord[]> {
    return Promise.reject(new Error(NOT_IMPLEMENTED_MESSAGE));
  }

  get(_id: string): Promise<TRecord> {
    return Promise.reject(new Error(NOT_IMPLEMENTED_MESSAGE));
  }

  create(_input: TCreateInput): Promise<TRecord> {
    return Promise.reject(new Error(NOT_IMPLEMENTED_MESSAGE));
  }

  update(_id: string, _input: TUpdateInput): Promise<TRecord> {
    return Promise.reject(new Error(NOT_IMPLEMENTED_MESSAGE));
  }

  delete(_id: string): Promise<void> {
    return Promise.reject(new Error(NOT_IMPLEMENTED_MESSAGE));
  }

  get endpoint(): string {
    return `${this.baseUrl}/${this.resourcePath}`;
  }
}
