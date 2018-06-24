# gulp-docker
A set of gulp tasks for automating Docker tasks.

## Introduction

These tasks were created to be used for containerizing Node HTTP(S|2) servers, and will have less utility for other purposes.

## Setup

Copy the gulpfile from the cloned directory to your project directory. This will be referred to hereafter as "the project directory."
If you haven't already, install the `gulp-cli` project, either locally with `npm install --save gulp-cli` or globally with
`npm install -g gulp-cli`. The latter may require administrative permissions. 

Change the five constants at the top of the file (**imageName**, **containerName**, **primaryPort**, **secondaryPort**,
and **letsEncryptDomain**). You may ignore **secondaryPort** if you are not using HTTP(2|S) redirection, and you may
ignore **letsEncryptDomain** if you are not using a Let's Encrypt setup. The value of **letsEncryptDomain** should be the
name of the relevant folder in */etc/letsencrypt/live/*, e.g. `/etc/letsencrypt/live/furkleindustries.com`.

## Tasks

### dockerBuild

Builds the image from the Dockerfile in the same directory as the gulpfile.

### dockerRun

Creates a running container from the image with the name matching the **imageName** constant, and names the container
with the **containerName** constant. Unlike the rest of the tasks, this one functions differently depending on the value
of the **h2** environment variable. 

If **h2** is not set, the container's port **primaryPort** is redirected to the host machine's port 80, and only HTTP is used.
If **h2** is set, two things change:

1. **privkey.pem** and **fullchain.pem** are copied from the provided Let's Encrypt directory to the `secrets/ssl/` directory
within the project directory, creating those directories if necessary.
2. The container's **primaryPort** port is redirected to the host machine's port `443`, and the container's **secondaryPort** port
is redirected to the host machine's port `80`. The intent behind publishing two ports is to use the secondary port for a secondary
server which redirects all requests to the relevant HTTPS URL.

### dockerKill

Kills the running container with a name matching the **containerName** constant.

### dockerStop

Stops the running container with a name matching the **containerName** constant.

### dockerClean

Runs the `docker system prune -f` command, which forcibly removes all Docker images, layers, and metadata that are not
currently in use. This is a critical part of automating Docker tasks, as small drive spaces will quickly be filled by
unused, old Docker content otherwise.

### dockerUp

Calls the *dockerClean*, *dockerBuild* and *dockerRun* tasks serially. This will create a running Docker container from a project
directory and a Dockerfile.

### dockerRebuild

Same as *dockerUp*, but calls the *dockerKill* task beforehand. It is important to note that this task will fail if there is no
container with the name matching the **containerName** constant running at the time, so you cannot use it if the container has
failed or has never been run. This may be improved in future releases.
