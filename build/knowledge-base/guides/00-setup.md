---
title: "Setting up for development on spirit of Kiro - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/learn-by-playing/00-setup/"
category: "guides"
lastUpdated: "2026-02-07T05:52:09.150Z"
---
# Setting up for development on spirit of Kiro

---

## Setup local development environment

First, you need to launch a local copy of the game client and server, connected to
an AWS account. This way, when you use Kiro to modify the codebase, you can make
sure that your changes actually work.

#### Clone the Repository

Clone the [open source code repository](https://github.com/kirodotdev/spirit-of-kiro) and switch to the `challenge` branch:

```bash
git clone git@github.com:kirodotdev/spirit-of-kiro.git
cd spirit-of-kiro/
git checkout challenge

```

After you clone, check out a few key files to understand the project:

- architecture.md - An overview of the architecture
- appsec-overview.md - Details about how specific components of the game fit together.

#### Prerequisite Dependencies

You'll need the following dependencies installed:

- Docker Desktop or Podman
(recommended).
- AWS Setup:
  - An AWS account
  - The AWS CLI installed locally
  - Configure authentication to AWS
- AWS Bedrock model access to one or more of:
  - Amazon Nova Pro
  - Anthropic Claude Sonnet 3.7
  - Anthropic Claude Sonnet 4

#### Verify Dependencies

Run the dependency check script to verify everything is set up correctly:

```sh
./scripts/check-dependencies.sh

```

Loading image...

#### Deploy Cognito User Pool

Deploy an Amazon Cognito user pool for authentication (available in AWS Free Tier):

```bash
./scripts/deploy-cognito.sh game-auth

```

You can substitute 'game-auth' with your own custom CloudFormation stack name.

Loading image...

#### Build and Launch

Build and launch the game stack using either Docker or Podman:

```bash
podman compose build &&
podman compose up \
  --watch \
  --remove-orphans \
  --timeout 0 \
  --force-recreate

```

The first time you run this command it may take a couple minutes. Subsequent
runs should complete in seconds.

Loading image...

If this is your first time using Podman, you will need to
run `podman machine init && podman machine start` before using Podman.

After completion, you should see the game containers running in your container interface.
The following example shows the Podman UI:
Loading image...

You can use `Control + C` or `Command + C` to stop the entire stack.

When using Podman, on some operating systems the virtual machine can experience a
time desync issue on system sleep. This will cause issues with the applications
ability to communicate with AWS. If you encounter this you can fix it with
the following command:

```sh
podman machine ssh sudo systemctl restart chronyd.service

```

#### Bootstrap database

When your stack launches locally, it also launches [DynamoDB local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html),
a special container that imitates the DynamoDB AWS service, but running
locally on your own machine. The game is expecting several
tables to be created in this DynamoDB container.

While the game stack is still running, open a new terminal and use the
following commands to automatically create the necessary tables:

```sh
podman exec server mkdir -p /app/server/iac &&
podman cp scripts/bootstrap-local-dynamodb.js server:/app/ &&
podman cp server/iac/dynamodb.yml server:/app/server/iac/ &&
podman exec server bun run /app/bootstrap-local-dynamodb.js

```

Loading image...

The DynamoDB database is persisted across restarts, by saving it to
the file `docker/dynamodb/shared-local-instance.db`. If you wish
to clear it out or change the structure of a table, then delete this
file, restart the game stack, and rerun this database bootstrap command.

#### Test it out

It’s time to verify that everything is working properly. Try the following command
first to make sure that the game server is running locally:

```sh
curl localhost:8080

```

You should see the response `OK`

Next open your web browser and put the following address into the address bar:

```
localhost:5173

```

You should see the homepage of the game client. Create an account and start playing.

## Game guide

Here are some basic things to try in the game:

- WASD to move around, E to interact
- Pull random items using the red "PULL" lever
- Pick up items and carry them around with E. Throw a held item with T.
Hint: Items can be thrown out the door at the bottom.
- Carry an item to the workbench and use E to put it on the workbench.
Drag items around to move them up to the tool wall on the back, or
down to the working area at the bottom. Click an item on the tool wall
to cast one of it's "quirks", then select one or more targets for the
"quirk". Both the tool and the targets will transform based on the quirk.
Get creative with this, there are near infinite possibilities, and you
can make some truly bizarre things.
- If you are smashing items or otherwise cutting or breaking them into
pieces, and there are a lot of items in the working area of the workbench
they will overflow and fall off onto the ground around the workbench.
Try not to let the ground get too messy!
- The chest is for storage when you have too many items.
- When an item is thrown out the door at the bottom of the shop keeper
will judge it and you'll get money for it. He likes items that are fun,
unusual, in good condition, or that seem like rare collectables.
- The computer shows items that have been discarded or given to the
appraiser, both by yourself and by other players. This serves as a
randomized “shop” where you can indirectly buy from other players,
or buy back things you lost.

Done playing with your copy of the game? Let's get to work on the first task:

[Steering Kiro, and improving the game homepage](../01-improve-the-homepage)