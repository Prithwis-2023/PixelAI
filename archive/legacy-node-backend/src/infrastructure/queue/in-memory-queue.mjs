export class InMemoryQueue {
  constructor() {
    this.jobs = [];
  }

  enqueue(job) {
    this.jobs.push(job);
    return { accepted: true, depth: this.jobs.length };
  }

  list() {
    return [...this.jobs];
  }
}
