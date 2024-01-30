
const LOG_LEVEL = {
  INFO: {
    level: 0,
    prefix: "[i] "
  },
  WARNING: {
    level: 1,
    prefix: "[w] "
  },
  ERROR: {
    level: 2,
    prefix: "[e] "
  },
}
const LOG_LEVEL_CUTOFF = LOG_LEVEL.WARNING;

function log_message(level, message) {
  let log_level = LOG_LEVEL[`${level}`];
  if (log_level != null && log_level.level >= LOG_LEVEL_CUTOFF.level)
    console.log(log_level.prefix + message)
}