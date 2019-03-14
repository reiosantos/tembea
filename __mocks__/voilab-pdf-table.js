export default class PdfTableMock {
  constructor() { };

  addBody() { jest.fn() };
  setColumnsDefaults() {
    return {
      addColumns: jest.fn(()=>({
        onPageAdded: jest.fn()
      }))
    }
  }
}
