require('dotenv').config();
const {
  DEBUG = false,
  FILTER_LABELS = null,
  ESL_IP = '127.0.0.1',
  ESL_PORT = 8021,
  ESL_PASSWORD = 'ClueCon',
  METRICS_HOST = 'localhost',
  METRICS_PORT = '8031',
  METRICS_PATH = '/metrics',
} = process.env;

const { buildMetrics, createAgent } = require('./src/exporter.js');
const ESL_W = require('./src/esl.js');

const LABEL_FILTER_HASH = !FILTER_LABELS
  ? {}
  : FILTER_LABELS.split(", ").reduce((acc, label) => {
    acc[label] = true;
    return acc;
  }, {});

if (!DEBUG) {
  console.debug = () => {};
  console.trace = () => {};
}

const ESL = new ESL_W(ESL_IP, ESL_PORT, ESL_PASSWORD);
const Agent = createAgent(METRICS_HOST, METRICS_PORT, METRICS_PATH);

const getBBBChannelType = (channelData) => {
  const { cid_num, presence_data } = channelData;
  const duplexReg = /.*-bbbID-.*/;
  const fsRecvReg = /.*-bbbID-LISTENONLY-.*/;
  const sfuRecvReg = /^GLOBAL_AUDIO_\d+$/;

  if (duplexReg.test(cid_num)) {
    if (presence_data === 'from_bbb-webrtc-sfu') {
      return 'sfu-sendrecv';
    } else {
      return 'fs-sendrecv';
    }
  }

  if (sfuRecvReg.test(cid_num)) {
    return 'sfu-global-audio';
  }

  if (fsRecvReg.test(cid_num)) {
    return 'fs-recvonly';
  }

  return 'external';
}

const metrics = buildMetrics(LABEL_FILTER_HASH);
Agent.injectMetrics(metrics);

const collector = async (response) => {
  ESL.executeCommand('show channels as json').then(async (eslResponse) => {
    const { rows = [] } = JSON.parse(eslResponse.getBody());

    rows.forEach(async (row) => {
      const { uuid, dest, callstate } = row;
      const bbbChannelType = getBBBChannelType(row);
      const labels = {
        ...(!LABEL_FILTER_HASH['uuid'] && { uuid }),
        ...(!LABEL_FILTER_HASH['dest'] && { dest }),
        ...(!LABEL_FILTER_HASH['callstate'] && { callstate }),
        ...(!LABEL_FILTER_HASH['bbbChannelType'] && { bbbChannelType }),
      };

      try {
        const statsResp = await ESL.executeCommand(
          `json {"command":"mediaStats", "data": {"uuid":"${uuid}"}}`
        );
        const mediaStats = JSON.parse(statsResp.getBody());
        const { response } = mediaStats;
        Agent.increment('bbb_fs_audio_channels', { bbbChannelType, callstate });

        Object.entries(response.audio).forEach(([key, value]) => {
          Agent.set(key, value, labels);
        });
      } catch (error) {
        console.log(`mediaStats for ${uuid || "*Unknown*}"} failed`, error);
      }
    });
  }).catch((error) => {
    console.error('show channels as json failed', error);
  });

  return response;
}

ESL.start().then(() => {
  Agent.collect = collector;
  Agent.start();
});
