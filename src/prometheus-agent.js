const {
  register,
} = require('prom-client');
const HTTPServer = require('./http-server.js');

module.exports = class PrometheusScrapeAgent {
  constructor (host, port, options) {
    this.host = host;
    this.port = port;
    this.metrics = {};
    this.started = false;

    this.path = options.path || '/metrics';
    this.metricsPrefix = options.prefix || '';
    this.collectionTimeout = options.collectionTimeout || 10000;
  }

  getMetric (name) {
    return this.metrics[name];
  }

  async _collect (response) {
    try {
      const _response = await this.collect(response);
      _response.writeHead(200, { 'Content-Type': register.contentType });
      const content = await register.metrics();
      _response.end(content);
    } catch (error) {
      response.writeHead(500)
      response.end(error.message);
      console.error('Prometheus: error collecting metrics',
        { errorCode: error.code, errorMessage: error.message });
    }
  }

  collect (response) {
    return Promise.resolve(response);
  }

  defaultMetricsHandler (request, response) {
    switch (request.method) {
      case 'GET':
        if (request.url === this.path) return this._collect(response);
        response.writeHead(404).end();
        break;
      default:
        response.writeHead(501)
        response.end();
        break;
    }

    return null;
  }

  start (requestHandler = this.defaultMetricsHandler.bind(this)) {
    this.metricsServer = new HTTPServer(this.host, this.port, requestHandler);
    this.metricsServer.start();
    this.metricsServer.listen();
    this.started = true;
  }

  injectMetrics (metricsDictionary) {
    this.metrics = { ...this.metrics, ...metricsDictionary }
  }

  increment (metricName, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      metric.inc(labelsObject)
    }
  }

  decrement (metricName, labelsObject) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      metric.dec(labelsObject)
    }
  }

  set (metricName, value, labelsObject = {}) {
    if (!this.started) return;

    const metric = this.metrics[metricName];
    if (metric) {
      metric.set(labelsObject, value)
    }
  }

  setCollectorWithGenerator (metricName, generator) {
    const metric = this.getMetric(metricName);
    if (metric) {
      metric.collect = () => {
        metric.set(generator());
      };
    }
  }

  setCollector (metricName, collector) {
    const metric = this.getMetric(metricName);

    if (metric) {
      metric.collect = collector.bind(metric);
    }
  }

  reset (metrics = []) {
    if (metrics == null || metrics.length === 0) {
      register.resetMetrics();
      return;
    }

    metrics.forEach(metricName => {
      const metric = this.getMetric(metricName);

      if (metric) {
        register.reset(metricName);
      }
    });
  }
}
