export class InMemoryTelemetryStore {
  constructor() {
    this.events = [];
  }

  save(event) {
    this.events.push(event);
    return event;
  }

  list({ from, to } = {}) {
    return this.events.filter((event) => {
      const time = new Date(event.occurredAt).getTime();
      if (from && time < new Date(from).getTime()) return false;
      if (to && time > new Date(to).getTime()) return false;
      return true;
    });
  }
}
