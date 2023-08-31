## bbb-freeswitch-exporter

Prometheus exporter for FreeSWITCH metrics (as used in BigBlueButton).
This is not intended for general use, but rather as a tool for monitoring BigBlueButton deployments.

### Configuration

Configuration is done via environment variables (or a environment variable file `.env`).
See `env.template` for a list of all available variables:

```env
DEBUG=false
FILTER_LABELS=''
ESL_IP='127.0.0.1'
ESL_PORT=8021
ESL_PASSWORD='ClueCon'
METRICS_HOST='127.0.0.1'
METRICS_PORT='8031'
METRICS_PATH='/metrics'
```
### Running

The exporter can be run as a regular Node.js application or as a Docker container.
Dockerfile is provided.

### Metrics

The exporter exposes the following metrics:

```prometheus
# HELP bbb_fs_audio_channels Number of audio channels
# TYPE bbb_fs_audio_channels gauge
bbb_fs_audio_channels{bbbChannelType="sfu-global-audio",callstate="ACTIVE"} 1

# HELP bbb_fs_in_quality_mos Mean opinion score (MOS) of the audio quality
# TYPE bbb_fs_in_quality_mos gauge
bbb_fs_in_quality_mos{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 4.5

# HELP bbb_fs_in_quality_percentage Percentage of audio quality
# TYPE bbb_fs_in_quality_percentage gauge
bbb_fs_in_quality_percentage{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 100

# HELP bbb_fs_in_flaw_total Total number of inbound flaws
# TYPE bbb_fs_in_flaw_total gauge
bbb_fs_in_flaw_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_mean_interval_ms Mean interval between inbound packets ~ ptime (ms)
# TYPE bbb_fs_in_mean_interval_ms gauge
bbb_fs_in_mean_interval_ms{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_largest_jb_size_bytes Largest jitterbuffer size in bytes
# TYPE bbb_fs_in_largest_jb_size_bytes gauge
bbb_fs_in_largest_jb_size_bytes{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_jitter_min_variance_ms Min jitter (ms)
# TYPE bbb_fs_in_jitter_min_variance_ms gauge
bbb_fs_in_jitter_min_variance_ms{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_jitter_max_variance_ms Max jitter (ms)
# TYPE bbb_fs_in_jitter_max_variance_ms gauge
bbb_fs_in_jitter_max_variance_ms{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_jitter_loss_rate Packet loss rate
# TYPE bbb_fs_in_jitter_loss_rate gauge
bbb_fs_in_jitter_loss_rate{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_jitter_burst_rate Packet burst rate
# TYPE bbb_fs_in_jitter_burst_rate gauge
bbb_fs_in_jitter_burst_rate{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_jitter_packets_total Total number of packets read from jitterbuffer
# TYPE bbb_fs_in_jitter_packets_total gauge
bbb_fs_in_jitter_packets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_flush_packets_total Total number of buffered inbound packets flushed by FreeSWITCH
# TYPE bbb_fs_in_flush_packets_total gauge
bbb_fs_in_flush_packets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_skip_packets_total Total skipped inbound audio packets (usually due to CNG)
# TYPE bbb_fs_in_skip_packets_total gauge
bbb_fs_in_skip_packets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 174898

# HELP bbb_fs_in_raw_bytes_total Total number of bytes received (raw)
# TYPE bbb_fs_in_raw_bytes_total gauge
bbb_fs_in_raw_bytes_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_out_raw_bytes_total Total number of bytes sent (raw)
# TYPE bbb_fs_out_raw_bytes_total gauge
bbb_fs_out_raw_bytes_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 10863208

# HELP bbb_fs_in_media_bytes_total Total number of media-only bytes received
# TYPE bbb_fs_in_media_bytes_total gauge
bbb_fs_in_media_bytes_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_out_media_bytes_total Total number of media-only bytes sent
# TYPE bbb_fs_out_media_bytes_total gauge
bbb_fs_out_media_bytes_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 10863208

# HELP bbb_fs_rtcp_audio_octets_total Total number of RTCP octets/bytes
# TYPE bbb_fs_rtcp_audio_octets_total gauge
bbb_fs_rtcp_audio_octets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_in_cng_packets_total Total number of inbound comfort noise packets (CNG)
# TYPE bbb_fs_in_cng_packets_total gauge
bbb_fs_in_cng_packets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0

# HELP bbb_fs_out_cng_packets_total Total number of outbound comfort noise packets (CNG)
# TYPE bbb_fs_out_cng_packets_total gauge
bbb_fs_out_cng_packets_total{uuid="a5a17648-e20e-4860-b5b6-fc3d283f94a2",dest="79646",callstate="ACTIVE",bbbChannelType="sfu-global-audio"} 0
```

A couple of those labels have *high cardinality* (`uuid` and `dest`). To disable
any of the labels above, use the FILTER_LABELS environment variable. For example,
to disable the `dest` and `uuid` labels, set `FILTER_LABELS=dest,uuid`.
