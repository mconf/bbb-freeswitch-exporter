const http = require("http");

module.exports = class HttpServer {
  constructor(host, port, callback) {
    this.host = host;
    this.port = port;
    this.requestCallback = callback;
  }

  start () {
    this.server = http.createServer(this.requestCallback)
      .on('error', this.handleError.bind(this))
      .on('clientError', this.handleError.bind(this));
  }

  close (callback) {
    return this.server.close(callback);
  }

  handleError (error) {
    if (error.code === 'EADDRINUSE') {
      console.warn("EADDRINUSE, won't spawn HTTP server", {
        host: this.host, port: this.port,
      });
      this.server.close();
    } else if (error.code === 'ECONNRESET') {
      console.warn("HTTPServer: ECONNRESET ", { errorMessage: error.message });
    } else {
      console.error("Returned error", error);
    }

    throw error;
  }

  getServerObject() {
    return this.server;
  }

  listen(callback) {
    console.info(`HTTPServer is listening: ${this.host}:${this.port}`);
    this.server.listen(this.port, this.host, callback);
  }
}
