const {spawn} = require('child_process');
const yargs = require('yargs');
const argv = yargs
  .option('t', {
    alias: 'time',
    default: '10',
    type: 'string',
    description: 'Set the time(length) of the benchmark.',
  })
  .option('d', {
    alias: 'delay',
    default: '3',
    type: 'number',
    description: 'Delay frame times aggregation.',
  })
  .option('stdin', {
    alias: 'i',
    default: false,
    type: 'boolean',
    description:
      'Use stdin as source of hitrace traces. This allows to manually capture traces.',
  })
  .example(
    '$0 -t 10',
    'measures the frame times (the time between each in the next 10 seconds using hitrace graphic',
  )
  .example(
    'hdc shell hitrace graphic --trace_finish | node $0  --stdin',
    'finishes capturing traces and calculates the frame-times based on them',
  )
  .help('h')
  .alias('h', 'help').argv;

const getFrameTimes = hitraceOutput => {
  const regex =
    /^(\s+\S+)(\s+\()(\s+\d+\))(\s+\[\d+\])\s+\.{4}\s+(\d+\.\d+):\s+(\w+:\s+)(.*)/;
  const parsedTraces = hitraceOutput
    .trim()
    .split('\n')
    .map(line => {
      const match = line.match(regex);
      return match
        ? {
            timestamp: Number(match[5].trim()),
            functionDetails: match[7].trim(),
          }
        : null;
    })
    .filter(trace => trace && trace.timestamp && trace.functionDetails);
  //console.log(JSON.stringify(parsedTraces, null, 2));

  const repaintTimestamps = parsedTraces
    .filter(
      trace =>
        trace.functionDetails.includes('Repaint') || //this is for traces from the device
        trace.functionDetails.includes('finishFrame'), //this is for traces from the emulator
    )
    .map(trace => trace.timestamp);
  if (repaintTimestamps.length === 0) {
    console.error('no repaint traces captured!');
    return;
  }

  const frameTimes = [];
  for (let i = 1; i < repaintTimestamps.length; i++) {
    frameTimes.push(repaintTimestamps[i] - repaintTimestamps[i - 1]);
  }
  return frameTimes;
};

const run = () => {
  const command = 'hdc';
  const {t: time, stdin} = argv;
  const args = ['shell', 'hitrace', 'graphic', '-t', time];

  let hitraceOutput = '';
  if (stdin) {
    process.stdin.on('data', chunk => {
      hitraceOutput += chunk;
    });
    process.stdin.on('end', () => {
      let frameTimes = getFrameTimes(hitraceOutput);
      console.log(JSON.stringify(frameTimes));
    });
  } else {
    const child = spawn(command, args);
    let intervalExecutionCounter = 0;
    const interval = setInterval(() => {
      console.warn(argv.d - intervalExecutionCounter - 1 + '...');
      intervalExecutionCounter++;
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      console.warn('Recording started...');
      child.stdout.on('data', chunk => {
        hitraceOutput += chunk;
      });
    }, argv.d * 1000);

    child.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    child.on('error', error => {
      console.error(`spawn error: ${error}`);
    });

    child.on('close', () => {
      let frameTimes = getFrameTimes(hitraceOutput);
      console.log(JSON.stringify(frameTimes));
    });
  }
};

run();
