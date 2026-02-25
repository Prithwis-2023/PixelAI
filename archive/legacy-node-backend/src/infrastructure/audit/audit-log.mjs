export class AuditLog {
  constructor() {
    this.records = [];
  }

  append(record) {
    this.records.push({
      ...record,
      timestamp: new Date().toISOString()
    });
  }

  list() {
    return [...this.records];
  }
}
