/* eslint-disable no-return-assign */
export class MockFile {
  constructor(path) {
    this.path = path;
    this.metadata = { name: 'test' };
    this.message = true;
  }

  getMetadata() {
    return [this.metadata];
  }

  delete() {
    return this.message;
  }
}

export class MockBucket {
  constructor(name) {
    this.name = name;
    this.files = {};
    this.message = true;
  }

  file(path) {
    return this.files[path] || (this.files[path] = new MockFile(path));
  }

  upload() {
    return this.message;
  }
}

export class MockStorage {
  constructor() {
    this.buckets = {};
  }

  bucket(name) {
    return this.buckets[name] || (this.buckets[name] = new MockBucket(name));
  }
}
