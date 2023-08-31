const PrometheusAgent = require('./prometheus-agent.js');
const { Gauge } = require('prom-client');

const buildMetrics = (labelFilter) => {
  const completeLabelSet = [
    'uuid',
    'dest',
    'callstate',
    'bbbChannelType',
  ].filter((label) => !labelFilter[label]);
  const partialLabelSet = [
    'callstate',
    'bbbChannelType',
  ].filter((label) => !labelFilter[label]);

  const metrics = {
    // Custom metrics
    'bbb_fs_audio_channels': new Gauge({
      name: 'bbb_fs_audio_channels',
      help: 'Number of audio channels',
      labelNames: partialLabelSet,
    }),

    // Raw FS metrics
    'in_mos': new Gauge({
      name: 'bbb_fs_in_quality_mos',
      help: 'Mean opinion score (MOS) of the audio quality',
      labelNames: completeLabelSet,
    }),
    'in_quality_percentage': new Gauge({
      name: 'bbb_fs_in_quality_percentage',
      help: 'Percentage of audio quality',
      labelNames: completeLabelSet,
    }),
    'in_flaw_total': new Gauge({
      name: 'bbb_fs_in_flaw_total',
      help: 'Total number of inbound flaws',
      labelNames: completeLabelSet,
    }),
    'in_mean_interval': new Gauge({
      name: 'bbb_fs_in_mean_interval_ms',
      help: 'Mean interval between inbound packets ~ ptime (ms)',
      labelNames: completeLabelSet,
    }),
    'in_largest_jb_size': new Gauge({
      name: 'bbb_fs_in_largest_jb_size_bytes',
      help: 'Largest jitterbuffer size in bytes',
      labelNames: completeLabelSet,
    }),
    'in_jitter_min_variance': new Gauge({
      name: 'bbb_fs_in_jitter_min_variance_ms',
      help: 'Min jitter (ms)',
      labelNames: completeLabelSet,
    }),
    'in_jitter_max_variance': new Gauge({
      name: 'bbb_fs_in_jitter_max_variance_ms',
      help: 'Max jitter (ms)',
      labelNames: completeLabelSet,
    }),
    'in_jitter_loss_rate': new Gauge({
      name: 'bbb_fs_in_jitter_loss_rate',
      help: 'Packet loss rate',
      labelNames: completeLabelSet,
    }),
    'in_jitter_burst_rate': new Gauge({
      name: 'bbb_fs_in_jitter_burst_rate',
      help: 'Packet burst rate',
      labelNames: completeLabelSet,
    }),
    'in_jitter_packet_count': new Gauge({
      name: 'bbb_fs_in_jitter_packets_total',
      help: 'Total number of packets read from jitterbuffer',
      labelNames: completeLabelSet,
    }),
    'in_flush_packet_count': new Gauge({
      name: 'bbb_fs_in_flush_packets_total',
      help: 'Total number of buffered inbound packets flushed by FreeSWITCH',
      labelNames: completeLabelSet,
    }),
    'in_skip_packet_count': new Gauge({
      name: 'bbb_fs_in_skip_packets_total',
      help: 'Total skipped inbound audio packets (usually due to CNG)',
      labelNames: completeLabelSet,
    }),
    'in_raw_bytes': new Gauge({
      name: 'bbb_fs_in_raw_bytes_total',
      help: 'Total number of bytes received (raw)',
      labelNames: completeLabelSet,
    }),
    'out_raw_bytes': new Gauge({
      name: 'bbb_fs_out_raw_bytes_total',
      help: 'Total number of bytes sent (raw)',
      labelNames: completeLabelSet,
    }),
    'in_media_bytes': new Gauge({
      name: 'bbb_fs_in_media_bytes_total',
      help: 'Total number of media-only bytes received',
      labelNames: completeLabelSet,
    }),
    'out_media_bytes': new Gauge({
      name: 'bbb_fs_out_media_bytes_total',
      help: 'Total number of media-only bytes sent',
      labelNames: completeLabelSet,
    }),
    'rtcp_octet_count': new Gauge({
      name: 'bbb_fs_rtcp_audio_octets_total',
      help: 'Total number of RTCP octets/bytes',
      labelNames: completeLabelSet,
    }),
    'in_cng_packet_count': new Gauge({
      name: 'bbb_fs_in_cng_packets_total',
      help: 'Total number of inbound comfort noise packets (CNG)',
      labelNames: completeLabelSet,
    }),
    'out_cng_packet_count': new Gauge({
      name: 'bbb_fs_out_cng_packets_total',
      help: 'Total number of outbound comfort noise packets (CNG)',
      labelNames: completeLabelSet,
    }),
  };

  return metrics;
}

const createAgent = (host, port, path) => {
  const agent = new PrometheusAgent(host, port, {
    path,
    prefix: 'bbb_fs_',
  });

  return agent;
};

module.exports = {
  buildMetrics,
  createAgent
};
