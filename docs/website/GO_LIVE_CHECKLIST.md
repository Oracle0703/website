# Website Phase 1 Go-Live Checklist (meaningful.ink / www.meaningful.ink)

目标：把 `apps/website/` 以 **Windows Server 2022 + Nginx + NSSM** 方式上线，并支持：
- `https://meaningful.ink/`
- `https://www.meaningful.ink/`

约束：
- 不要把任何密钥提交到 git。
- Next.js 仅本机监听（建议 `127.0.0.1:3000`），公网只暴露 80/443（Nginx）。

---

## 0) P0 需要先确认（上线前必须明确）
以下信息如果不明确，会直接阻塞上线或导致回滚不可用：

- **域名策略**：`meaningful.ink` / `www.meaningful.ink` 谁做主站？另一方是否 301 跳转？
- **证书**：Nginx 上这两个域名的 TLS 证书如何获取/续期（Let's Encrypt / 手动证书 / 其它）？
- **Windows SSH**：Windows 是否已开启 OpenSSH Server（sshd），并允许 CI Runner 访问（公网入站）？
- **服务名**：NSSM 服务名（建议固定为 `meaningful-website`，部署/回滚脚本都依赖）
- **端口**：Next.js 监听端口（默认 3000，建议固定；以及只监听 127.0.0.1）
- **目录约定**（建议一次性定死，减少脚本分歧）：
  - Incoming：`C:\incoming`（scp 上传 zip 的落点；Secrets 里建议写 `C:/incoming`）
  - Releases：`C:\services\website\releases\<BuildId>`
  - Logs：`C:\logs\website`
  - Deploy script：`C:\deploy\website-deploy.ps1`

---

## 1) Gitee CI/CD Secrets（website-cd-prod 需要）
对应 `gitee/website/.gitee/workflows/website-cd.yml`。

在 Gitee 仓库 Settings → Secrets 中设置：

- `DEPLOY_HOST`：Windows Server 公网 IP / 域名
- `DEPLOY_PORT`：SSH 端口（例如 `22`）
- `DEPLOY_USER`：Windows SSH 登录用户名
- `DEPLOY_SSH_KEY`：用于 ssh/scp 的私钥（建议 PEM 原文；如果复制会混入 CRLF，需要确保不带 `\r`）
- `DEPLOY_INCOMING_DIR`：Windows 上 incoming 目录（建议用正斜杠写法，便于 scp：例如 `C:/incoming`；PowerShell 也能识别）
- `DEPLOY_PS1`：Windows 上部署脚本的完整路径（例如 `C:\deploy\website-deploy.ps1`）

建议：为部署创建一个专用用户，最小化权限（仅部署目录读写 + 能重启服务）。

---

## 2) Windows Server 一次性准备
管理员 PowerShell：

```powershell
# 目录约定（按需调整，但建议固定）
mkdir C:\incoming
mkdir C:\services\website\releases
mkdir C:\logs\website
mkdir C:\deploy
```

依赖：
- Node.js（建议 20+）
- OpenSSH Server（sshd）
- Nginx for Windows（例如 `C:\nginx\nginx.exe`）
- NSSM（例如 `C:\tools\nssm\nssm.exe`）

验证：
```powershell
node -v
npm -v
```

---

## 3) 部署脚本（Windows，`DEPLOY_PS1` 指向）
`website-cd-prod` 最后一步会远程执行 PowerShell 脚本，并传入：
- `-BuildId <sha-or-manual>`
- `-ZipPath <incoming/website-src-<BuildId>.zip>`

仓库内提供一个可用的模板脚本：`docs/website/website-deploy.ps1`。
首次上线建议把它放到服务器：`C:\\deploy\\website-deploy.ps1`（手工复制文件，或用 scp 上传）。

然后把 Gitee Secret `DEPLOY_PS1` 指向 `C:\\deploy\\website-deploy.ps1`。

建议脚本最小行为：
1) 校验 zip 存在。
2) 解压到 `C:\services\website\releases\<BuildId>`。
3) 在解压目录执行：
   - `npm ci`
   - `npm -w apps/website run build`
4) 重启 NSSM 服务。
5) 追加一条部署日志到 `C:\logs\website`（可选，但强烈建议）。

注意：如果需要环境变量，优先用系统环境变量；不要把 `.env*` 放入仓库。

---

## 4) NSSM 服务（常驻 + 自动重启 + 日志）
建议服务名：`meaningful-website`。

安装（GUI）：
```powershell
C:\tools\nssm\nssm.exe install meaningful-website
```

GUI 参数建议：
- Path：`C:\Program Files\nodejs\npm.cmd`
- Startup directory：`C:\services\website\releases\<BuildId>`（首次可先手工选一个 buildId 目录）
- Arguments：
  - `run start -w apps/website -- -p 3000 -H 127.0.0.1`

I/O（建议）：
- stdout：`C:\logs\website\stdout.log`
- stderr：`C:\logs\website\stderr.log`

启动/重启：
```powershell
C:\tools\nssm\nssm.exe start meaningful-website
C:\tools\nssm\nssm.exe restart meaningful-website
```

---

## 5) Nginx 反代（meaningful.ink / www.meaningful.ink）
假设 Next.js 监听 `127.0.0.1:3000`。

主站（HTTPS）示例：

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;

  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $server_port;

  proxy_connect_timeout 30s;
  proxy_send_timeout 60s;
  proxy_read_timeout 60s;
  proxy_redirect off;
}
```

可选：静态资源缓存

```nginx
location ^~ /_next/static/ {
  proxy_pass http://127.0.0.1:3000;
  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";
}
```

Reload：
```powershell
C:\nginx\nginx.exe -s reload
```

www → apex（如决定 `meaningful.ink` 为主站）：

```nginx
server {
  listen 80;
  server_name www.meaningful.ink;
  return 301 https://meaningful.ink$request_uri;
}
```

---

## 6) 上线验证点（每次部署后必做）
本机验证（Windows）：
```powershell
curl http://127.0.0.1:3000/
```

公网验证：
```powershell
curl -I https://meaningful.ink/
curl -I https://www.meaningful.ink/
```

人工检查：
- 首页 `/`、入口 `/enter`、`/blog`、`/labs`、`/tracker` 是否可访问
- `/_next/static/` 返回 200（静态资源）
- 跳转策略符合预期（www ↔ apex）

---

## 7) 回滚步骤（必须可用）
回滚目标：快速切回上一个可用 `BuildId`。

最短回滚（手工）：
1) 在 NSSM 中把 `Startup directory` 改回旧的 `C:\services\website\releases\<oldBuildId>`
2) `nssm restart meaningful-website`
3) 复用第 6 节验证

推荐做法（降低回滚耗时）：
- 维护 `C:\services\website\current` 指向某个 release 目录
- NSSM Startup directory 固定为 `C:\services\website\current`
- 部署/回滚只切换 `current` 指向并重启服务

---

## 8) 触发部署（Gitee）
在 Gitee Actions 手动触发 `website-cd-prod`：
- `build_id` 留空：默认使用当前 commit sha
- 或手填一个更友好的 build id（例如 `20260212-1`）

部署完成后按第 6 节验证。
