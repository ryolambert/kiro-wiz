---
title: "Internet Access - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/sandbox/internet-access/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:36.429Z"
---
# Internet Access

---

Control which domains Kiro autonomous agent can access during task execution. You can choose from three network access levels: Connections access only, Common dependencies, or Open internet. You can also create a custom allow-list.

## Connections access only

The minimum access level required for the sandbox to function. This allows the agent to:

- Clone GitHub repositories
- Open and update pull requests
- Access GitHub via our gateway service

This is the most secure option and recommended when your tasks don't require external dependencies.

## Common dependencies

Includes access to connections plus common package registries and development tools. This level allows the agent to install dependencies from popular package managers without requiring full internet access.

The following domains are automatically allowed:

```
alpinelinux.org
amazonaws.com
anaconda.com
apache.org
apt.llvm.org
archlinux.org
aws.amazon.com
azure.com
bitbucket.org
bower.io
centos.org
cocoapods.org
continuum.io
cpan.org
crates.io
debian.org
docker.com
docker.io
dot.net
dotnet.microsoft.com
eclipse.org
fedoraproject.org
gcr.io
ghcr.io
github.com
githubusercontent.com
gitlab.com
golang.org
google.com
goproxy.io
gradle.org
hashicorp.com
haskell.org
hex.pm
java.com
java.net
jcenter.bintray.com
json-schema.org
json.schemastore.org
k8s.io
launchpad.net
maven.org
mcr.microsoft.com
metacpan.org
microsoft.com
nodejs.org
npmjs.com
npmjs.org
nuget.org
oracle.com
packagecloud.io
packages.microsoft.com
packagist.org
pkg.go.dev
ppa.launchpad.net
pub.dev
pypa.io
pypi.org
pypi.python.org
pythonhosted.org
quay.io
ruby-lang.org
rubyforge.org
rubygems.org
rubyonrails.org
rustup.rs
rvm.io
sourceforge.net
spring.io
swift.org
ubuntu.com
visualstudio.com
yarnpkg.com

```

## Open internet

Gives the sandbox unrestricted internet access.

Enabling network permissions exposes your environment to security risks. These include prompt injection attacks, extraction of code and secrets, introduction of malware or security flaws, and use of content that may violate licensing terms. Consider these risks carefully before enabling network permissions.

## Custom allow-list

You can specify a custom comma-separated list of allowed domains. Use the `.domain` format to include all subdomains.

**Examples:**

- api.example.com - Allow only this specific domain
- .example.com - Allow example.com and all subdomains (api.example.com, www.example.com, etc.)
- api.example.com, .cdn.example.com - Allow multiple domains and subdomain patterns