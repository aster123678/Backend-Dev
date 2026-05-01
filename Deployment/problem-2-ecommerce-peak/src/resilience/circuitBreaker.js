class CircuitBreaker {
  constructor(action, options = {}) {
    this.action = action;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.failures = 0;
    this.state = 'closed';
    this.nextAttemptAt = 0;
  }

  async fire(...args) {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptAt) {
        throw new Error('Circuit open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await this.action(...args);
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (error) {
      this.failures += 1;
      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
        this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
      }
      throw error;
    }
  }
}

module.exports = CircuitBreaker;

