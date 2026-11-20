---
title: Docker
description: 使用 Puppeteer 官方的 Docker 镜像跑浏览器自动化，包括镜像标签、需要的 SYS_ADMIN 权限，以及 dbus 相关的控制台警告。
order: 25
category: integrations
source: https://pptr.dev/guides/docker
summary:
  - 官方镜像里已经装好了 Chrome for Testing 和 Puppeteer
  - 浏览器以沙箱模式运行，因此需要 SYS_ADMIN 权限
  - 记得用 --init 或自定义 ENTRYPOINT 指定 init 进程
---

Puppeteer 提供了一个 Docker 镜像，里面包含 [Chrome for Testing](https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing)、所需的系统依赖，以及一个预装好的 Puppeteer 版本。镜像发布在 [GitHub Container Registry](https://github.com/puppeteer/puppeteer/pkgs/container/puppeteer) 上，最新的镜像打了 `latest` 标签，其余标签与 Puppeteer 的版本号对应。例如：

```bash
docker pull ghcr.io/puppeteer/puppeteer:latest # 拉取最新镜像
docker pull ghcr.io/puppeteer/puppeteer:16.1.0 # 拉取包含 Puppeteer v16.1.0 的镜像
```

这个镜像是为在沙箱模式下运行浏览器而设计的，因此运行它需要 `SYS_ADMIN` 能力。

### 用法

要直接使用该 Docker 镜像，运行：

```bash
docker run -i --init --cap-add=SYS_ADMIN --rm ghcr.io/puppeteer/puppeteer:latest node -e "$(cat path/to/script.js)"
```

其中 `path/to/script.js` 是相对于当前工作目录的路径。注意镜像需要 `SYS_ADMIN` 能力，因为浏览器是以沙箱模式运行的。

如果你要基于别的基础镜像构建自己的镜像，可以拿我们的 [`Dockerfile`](https://github.com/puppeteer/puppeteer/blob/main/docker/Dockerfile) 作为起点。

> **注意**
>
> 一定要通过 `--init` 参数或自定义 `ENTRYPOINT` 指定一个 init 进程，这样才能保证 Puppeteer 启动的所有进程都被妥善管理。

### dbus

镜像里为 Chrome 安装并配置了 dbus。无头模式下通常用不到 dbus，但你可能会在浏览器控制台里看到一些警告。你可以在启动应用之前先把 dbus 服务拉起来：

```
sudo service dbus start
```

关于如何在一个容器里启动多个进程，参见 [https://docs.docker.com/config/containers/multi-service_container/](https://docs.docker.com/config/containers/multi-service_container/)。
