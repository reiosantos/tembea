import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

class AppEvents {
  constructor() {
    this.subject = new Subject();
  }

  subscribe(name, subscriber) {
    this.subject.pipe(filter((e) => e.name === name))
      .subscribe((e) => subscriber(e.data));
  }

  broadcast({ name, data }) {
    this.subject.next({ name, data });
  }
}

const appEvents = new AppEvents();
export default appEvents;
