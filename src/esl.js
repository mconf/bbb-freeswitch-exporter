const EventEmitter = require('events');
const { Connection } = require('modesl');
const RECONNECTION_TIMER = 5000;

const ESL_EVENTS = {
  ALL: "ALL",
  DTMF: "DTMF",
  CUSTOM: "CUSTOM",
  API: "API",
  HEARTBEAT: "HEARTBEAT",
};

const LIB_EVTS = {
  END: "end",
  DISCONNECT_NOTICE: "disconnect::notice",
  FREESWITCH_RESTARTED: "freeswitchRestarted",
}

const ESL_FIELD = {
  CORE_UUID: 'Core-UUID',
  API_COMMAND: 'API-Command',
};

const ESL_SUBCLASSES = {
  MAINTENANCE: 'conference::maintenance'
}

module.exports = class ESL extends EventEmitter {
  constructor (host, port, password) {
    super();
    if (!host) throw new Error('Missing ESL host');
    if (!port) throw new Error('Missing ESL port');
    if (password === 'ClueCon') console.warn('Using default password for ESL connection');

    this._host = host;
    this._port = port;
    this._password = password;

    this._connected = false;
    this._subscribed = false;
    this._error = {};

    this._client = null;
    this._coreUUID = null;
    this._onAPIStatusEvent = this._onAPIStatusEvent.bind(this);
  }

  _connect () {
    console.log("Connecting to ESL server", { host: this._host, port: this._port });
    this._client = new Connection(
      this._host,
      this._port,
      this._password,
      this._onConnected.bind(this)
    );

    this._client.auth((error) => {
      if (error) {
        console.error(`FSESL connection authentication error (wrong password?)`);
        this.error = error;
        throw error;
      }
    });
  }

  _monitorESLClientConnectionErrors () {
    this._client.on('error', (error) => {
      if (error) {
        console.error(`FSESL connection received error ${error.code}`,
          { error });
        this.error = error;
        this._onDisconnection();
      }
    });
  }

  _waitForConnection (timeout = 10000) {
    const onConnected = () => {
      if (this.connected) {
        return Promise.resolve(this);
      }
      return new Promise((resolve) => {
        this.once('connected', () => {
          resolve(this);
        });
      });
    }

    const failOver = () => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          return reject(new Error('Failed to connect to ESL'));
        }, timeout);
      });
    };

    return Promise.race([onConnected(), failOver()]);
  }

  start () {
    try {
      this._connect();
      this._monitorESLClientConnectionErrors();
      return this._waitForConnection();
    } catch (error) {
      console.error(`Error when starting ESL interface`, { error });
      throw error;
    }
  }

  async stop () {
    if (this._client && typeof(this._client.end) == 'function') {
      this._client.end();
      this._client = null;
    }
  }

  _onConnected () {
    this._connected = true;
    this.emit('connected');

    console.info(`Connected to FreeSWITCH ESL`);

    if (this._reconnectionRoutine) {
      clearInterval(this._reconnectionRoutine);
      this._reconnectionRoutine = null;
    }

    this._client.subscribe(Object.values(ESL_EVENTS), this._onSubscribed.bind(this));
  }

  _onDisconnection () {
    if (this._reconnectionRoutine == null) {
      console.error(`FSESL connection dropped unexpectedly`);
      this._connected = false
      this.subscribed = false;

      this._reconnectionRoutine = setInterval(async () => {
        try {
          this.stop();
          this._connect();
          this._monitorESLClientConnectionErrors();
        } catch (error) {
          console.warn(`Failed to reconnect to FSESL, try again in ${RECONNECTION_TIMER}`,
            { error });
          this.stop();
        }
      }, RECONNECTION_TIMER);
    }
  }

  _onSubscribed () {
    this._client.on(`esl::event::${LIB_EVTS.DISCONNECT_NOTICE}`, this._onDisconnection.bind(this));
    this._client.on(`esl::${LIB_EVTS.END}`, this._onDisconnection.bind(this));
    this._client.on(`esl::event::${ESL_EVENTS.HEARTBEAT}::*`, this._onHeartbeat.bind(this));

    this.subscribed = true;
    this._runStatusCheck();
  }

  _onFSRestart () {
    this.emit(LIB_EVTS.FREESWITCH_RESTARTED);
  }

  _updateCoreUUID (tentativeUUID) {
    if (typeof this._coreUUID === 'string') {
      if (tentativeUUID != this._coreUUID) {
        console.warn('FreeSWITCH Core-UUID changed', {
          oldUUID: this._coreUUID, newUUID: tentativeUUID,
        });
        this._onFSRestart(tentativeUUID);
      }
    }

    this._coreUUID = tentativeUUID;
  }

  _onHeartbeat (event) {
    const coreUUID = event.getHeader(ESL_FIELD.CORE_UUID);
    if (coreUUID) this._updateCoreUUID(coreUUID);
  }

  _onAPIStatusEvent (event) {
    const apiCommand = event.getHeader(ESL_FIELD.API_COMMAND);
    const coreUUID = event.getHeader(ESL_FIELD.CORE_UUID);

    if (apiCommand !== 'status' || coreUUID == null) return;

    this._updateCoreUUID(coreUUID);
  }

  _runStatusCheck () {
    // Intercept the API event response to see if Core-UUID changed - if it
    // changed, it means a restart happened and we must fire an event upstream
    // so that the freeswitch.js adapter knows about it
    const evtName = `esl::event::${ESL_EVENTS.API}::*`;
    this._client.removeListener(evtName, this._onAPIStatusEvent);
    this._client.on(evtName, this._onAPIStatusEvent);
    this.executeCommand('status').catch((error) => {
      console.error('Error when getting FreeSWITCH status', { error });
    });
  }

  executeCommand (command) {
    return new Promise((resolve, reject) => {
      if (!this._connected) {
        console.error(`FSESL wrapper is disconnected, unable to execute ${command}`);
        reject(this.error);
      }
      console.debug(`FSESL sending command: ${command}`);
      this._client.api(command, (res) => {
        const body = res.getBody();
        console.debug(`FSESL Command response for "${command}" is: ${JSON.stringify(body)}`);
        if (this._hasError(body) && !body.includes('no reply')) {
          reject(new Error(body));
        }
        resolve(res);
      });
    });
  }

  _onCustomEvent(event) {
    const subclass = event.getHeader(ESL_FIELD.SUBCLASS);
    if (subclass === ESL_SUBCLASSES.MAINTENANCE) {
      // Future metrics
    }
  }

  //check if body has error message
  _hasError(body) {
    return body.startsWith("-ERR");
  }
}
