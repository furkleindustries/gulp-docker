/* Change these to the relevant values for your project. */
const imageName         = 'furkleindustries-homepage';
const containerName     = 'furkleindustries-homepage';
const primaryPort       = 3000;
const secondaryPort     = 3001;
const letsEncryptDomain = 'furkleindustries.com';
/* */

/* Dependencies */
const {
  exec,
} = require('child_process');
const {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} = require('fs');
const {
  resolve,
} = require('path');
const {
  promisify,
} = require('util');
/* */

const dockerBuild = async () => {
  console.log(`Building ${imageName} image.`);
  await promisify(exec)(`docker build -t ${imageName} ${__dirname}`);
  console.log(`Built ${imageName} container.`);
  console.log('dockerBuild task complete.');
};

module.exports.dockerBuild = dockerBuild;

const dockerClean = async () => {
  console.log('Cleaning docker system files.');
  await promisify(exec)('docker system prune -f');
  console.log('Cleaned docker system files.');
  console.log('dockerClean task complete.');
};

module.exports.dockerClean = dockerClean;

const dockerKill = async () => {
  console.log(`Killing ${containerName} container.`);
  await promisify(exec)(`docker kill ${containerName}`);
  console.log(`Killed ${containerName} container.`);
  console.log('dockerKill task complete.');
};

module.exports.dockerKill = dockerKill;

const dockerRun = async () => {
  console.log(`Running ${containerName} container.`);
  if (h2) {
    const mk = promisify(mkdir);
    await mk(`${__dirname}secrets/`);
    await mk(`${__dirname}secrets/ssl/`);

    const cp = promisify(copyFile);
    const sslDir = `/etc/letsencrypt/live/${letsEncryptDomain}/`;
    await Promise.all([
      cp(`${sslDir}privkey.pem`, `${__dirname}secrets/ssl/`),
      cp(`${sslDir}fullchain.pem`, `${__dirname}secrets/ssl/`),
    ]);
  }

  await promisify(exec)('docker run ' +
                        /* Run the process on a separate thread from the shell. */
                        '-d ' +
                        /* Call the container ${containerName}. */
                        `--name  ${containerName} ` +
                        (h2 ?
                          /* Expose port 3001 on the container as port 80 on the
                           * host machine, */
                          '-p 80:3001 ' +
                          /* and port 3000 on the container as port 443 on the
                          * host machine. */
                          '-p 443:3000 ' :
                          /* Or only use HTTP. */
                          '-p 80:3000 ') +
                        /* Run from the ${imageName} image. */
                        imageName);

  console.log(`Ran ${containerName} container.`);
  console.log('dockerRun task complete.');
};

module.exports.dockerRun = dockerRun;

const dockerUp = async () => {
  await dockerClean();
  await dockerBuild();
  await dockerRun();
  console.log('dockerUp task complete.');
};

const dockerRebuild = async () => {
  await dockerKill();
  await dockerUp();
  console.log('dockerRebuild task complete.');
};

module.exports.dockerRebuild = dockerRebuild;

const dockerStart = async () => {
  console.log(`Starting ${containerName} container.`);
  await promisify(exec)(`docker start ${containerName}`);
  console.log(`Started ${containerName} container.`);
  console.log('dockerStart task complete.');
};

module.exports.dockerStart = dockerStart;

const dockerStop = async () => {
  console.log(`Stopping ${containerName} container.`);
  await promisify(exec)(`docker stop ${containerName}`);
  console.log(`Stopped ${containerName} container.`);
  console.log('dockerStop task complete.');
};

module.exports.dockerStop = dockerStop;
