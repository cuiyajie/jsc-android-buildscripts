const _ = require('lodash');
const exec = require('shell-utils').exec;

const TIMES = 10;

const PACKAGE_NAME = 'com.javascriptcore.profiler';
const ACTIVITY_NAME = 'MainActivity';
const LOGCAT_TAG = 'JavaScriptCoreProfiler';

const TESTS = {
  tti: /ApplicationLoadedAndRendered:(\d+)/,
  sunspider: /sunspider:(\d+)/,
  jetstream: /jetstream:(\d+)/,
  octane2: /octane2:(\d+)/,
  sixspeed: /sixspeed:(\d+)/,
  renderflat: /RenderFlatResult:(\d+)/,
  renderdeep: /RenderDeepResult:(\d+)/
};

const density = getDensity();
console.log(`Device density: ${density}`);
const scale = density / 120;
const [width, height] = getScreenSize();
console.log(`Device width: ${width}`);
console.log(`Device height: ${height}`);

run();

function run() {
  let resultsStr = '';
  installProfiler();

  _.times(TIMES, (i) => {
    console.log(`test #${i}:`);
    clearLogcat();

    launchProfiler();
    clickOnJsTest();
    killProfiler();
    resultsStr += readLogcatFilteredOutput() + '\n';
    clearLogcat();

    launchProfiler();
    clickOnFlatRenderTest();
    killProfiler();
    resultsStr += readLogcatFilteredOutput() + '\n';
    clearLogcat();

    launchProfiler();
    clickOnDeepRenderTest();
    killProfiler();
    resultsStr += readLogcatFilteredOutput() + '\n';
    clearLogcat();
  })

  const resultLines = _.split(resultsStr, '\n');
  parseAndPrintTestResults(resultLines);
}

function parseAndPrintTestResults(resultLines) {
  console.log('\n\n\nTest Results:\n\n\n');
  _.forEach(TESTS, (test, name) => {
    const testValues = parseTestValues(resultLines, test);
    const testAverage = _.round(_.mean(testValues));
    console.log(`"${name}": "${testAverage}",`);
  });
  console.log('\n\n\n');
}

function readLogcatFilteredOutput() {
  return exec.execSyncRead(`adb logcat -d | grep "${LOGCAT_TAG}"`, true);
}

function parseTestValues(resultLines, regex) {
  return _.chain(resultLines)
    .map((line) => regex.exec(line))
    .filter(_.negate(_.isNil))
    .map((match) => Number(match[1]))
    .value();
}

function installProfiler() {
  const useI18n = _.includes(process.argv, 'i18n') ? '--project-prop i18n=true' : '';
  exec.execSync(`cd android && ./gradlew clean uninstallRelease installRelease ${useI18n}`);
}

function clearLogcat() {
  exec.execSyncSilent(`adb logcat -c`);
}

function waitForLogcatMsg(msg) {
  while (!_.includes(exec.execSyncRead(`adb logcat -d`, true), msg)) {
    exec.execSyncSilent(`sleep 1`);
  }
}

function launchProfiler() {
  console.log(`launching...`);
  exec.execSyncSilent(`adb shell am start-activity -W "${PACKAGE_NAME}/.${ACTIVITY_NAME}"`);
  waitForLogcatMsg(`${LOGCAT_TAG}:ApplicationLoadedAndRendered`);
}

function killProfiler() {
  console.log(`killing`);
  exec.execSyncSilent(`adb shell am force-stop ${PACKAGE_NAME}`);
  exec.execSyncSilent(`adb shell am kill ${PACKAGE_NAME}`);
}

function clickOnJsTest() {
  console.log(`js test`);
  const x = width / 2;
  const y = height / 2 - (60 * scale)
  exec.execSyncSilent(`adb shell input tap ${x} ${y}`);
  waitForLogcatMsg(`${LOGCAT_TAG}:JSProfile:Done`);
}

function clickOnFlatRenderTest() {
  console.log(`flat render test`);
  const x = width / 2;
  const y = height / 2;
  exec.execSyncSilent(`adb shell input tap ${x} ${y}`);
  waitForLogcatMsg(`${LOGCAT_TAG}:RenderFlatResult:`);
}

function clickOnDeepRenderTest() {
  console.log(`deep render test`);
  const x = width / 2;
  const y = height / 2 + (40 * scale);
  exec.execSyncSilent(`adb shell input tap ${x} ${y}`);
  waitForLogcatMsg(`${LOGCAT_TAG}:RenderDeepResult:`);
}

function getDensity() {
  return exec.execSyncRead(`adb shell wm density | grep -Eo "[0-9]+"`, true)
}

function getScreenSize() {
  const size = exec.execSyncRead(`adb shell wm size | grep -Eo "\\d+x\\d+"`, true);
  return size.split('x');
}
