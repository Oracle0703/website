# Dashboard API 部署手册（Windows Server 2022 + Nginx + ms.meaningful.ink）

目标：把 `apps/dashboard-api` 以 **127.0.0.1:8787** 方式运行，并通过 `https://ms.meaningful.ink/api/dashboard/` 对公网提供服务（由 Nginx 反代）。

约定：
- 不要把任何密钥提交到 git。
- `8787` 仅本机监听，不对公网开放。

---

## 0) 需要准备的值（不要在聊天里发明文）
- `OSS_ACCESS_KEY_ID`
- `OSS_ACCESS_KEY_SECRET`
- `ADMIN_PASSWORD`
- `JWT_SECRET`（建议随机 32+ 字符）

固定值（已确定）：
- `OSS_REGION=oss-cn-chengdu`
- `OSS_ENDPOINT=oss-cn-chengdu.aliyuncs.com`
- `OSS_BUCKET=dashborad-yu-bucket`
- `OSS_PREFIX=dashboard/`
- `PORT=8787`

---

## 1) 服务器安装依赖
1. 安装 Node.js（建议 22 LTS）
2. 安装 Git（建议）
3. 验证（PowerShell）：
   - `node -v`
   - `npm -v`

---

## 2) 拉代码并切到 PR 分支
```powershell
git clone <gitee仓库地址> D:\repos\website
cd D:\repos\website
git checkout feature/jarvis/20260208/monorepo-scaffold
npm install
npm -w apps/dashboard-api test
```

---

## 3) 密钥放置（推荐：系统环境变量）
管理员 PowerShell：

```powershell
setx OSS_ACCESS_KEY_ID "xxxxx" /M
setx OSS_ACCESS_KEY_SECRET "yyyyy" /M
setx ADMIN_PASSWORD "your-admin-password" /M
setx JWT_SECRET "a-long-random-secret" /M

setx OSS_REGION "oss-cn-chengdu" /M
setx OSS_ENDPOINT "oss-cn-chengdu.aliyuncs.com" /M
setx OSS_BUCKET "dashborad-yu-bucket" /M
setx OSS_PREFIX "dashboard/" /M
setx PORT "8787" /M
```

注意：`setx` 后需要 **重新打开** PowerShell 窗口（变量才生效）。

备选方案（不推荐长期用）：写 `.env` 文件（不进 git）
- 路径：`D:\repos\website\apps\dashboard-api\.env`
- 内容对照 `apps/dashboard-api/.env.example`

---

## 4) 先前台跑通（必须做）
新开 PowerShell：

```powershell
cd D:\repos\website
npm -w apps/dashboard-api run build
npm -w apps/dashboard-api run start
```

本机验证：
```powershell
curl http://127.0.0.1:8787/health
```

---

## 5) Nginx（ms.meaningful.ink）新增反代规则
在 `ms.meaningful.ink` 的 443 `server { ... }` 中，放在 `location /api/ { ... }` **之前**：

```nginx
location ^~ /api/dashboard/ {
  proxy_pass http://127.0.0.1:8787/;

  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $server_port;

  proxy_connect_timeout 30s;
  proxy_send_timeout 30s;
  proxy_read_timeout 30s;
  proxy_redirect off;
  proxy_buffering on;
}
```

Reload：
```powershell
C:\nginx\nginx.exe -s reload
```

公网验证：
```powershell
curl https://ms.meaningful.ink/api/dashboard/health
```

---

## 6) API 最小联调（确认 auth + OSS）
1) 登录拿 token
```powershell
curl -X POST https://ms.meaningful.ink/api/dashboard/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"password\":\"<ADMIN_PASSWORD>\"}"
```

2) 读 tasks
```powershell
curl https://ms.meaningful.ink/api/dashboard/tasks `
  -H "Authorization: Bearer <TOKEN>"
```

3) 写一条 log（会写入 OSS：`dashboard/logs/YYYY-MM-DD.json`）
```powershell
curl -X POST https://ms.meaningful.ink/api/dashboard/logs `
  -H "Authorization: Bearer <TOKEN>" `
  -H "Content-Type: application/json" `
  -d "{\"message\":\"hello dashboard\"}"
```

---

## 7) NSSM 服务化（常驻 + 自动重启 + 日志）
1) 下载 NSSM：<https://nssm.cc/download>
- 放到：`C:\tools\nssm\nssm.exe`

2) 创建日志目录
```powershell
mkdir D:\logs\dashboard-api
```

3) 安装服务
```powershell
C:\tools\nssm\nssm.exe install dashboard-api
```

GUI 填写：
- Path：`C:\Program Files\nodejs\node.exe`
- Startup directory：`D:\repos\website\apps\dashboard-api`
- Arguments：
  - 如果用系统环境变量：
    - `D:\repos\website\apps\dashboard-api\dist\src\index.js`
  - 如果用 `.env` 文件：
    - `--env-file=D:\repos\website\apps\dashboard-api\.env D:\repos\website\apps\dashboard-api\dist\src\index.js`

I/O（建议）：
- stdout：`D:\logs\dashboard-api\stdout.log`
- stderr：`D:\logs\dashboard-api\stderr.log`

Exit actions：选择 Restart。

4) 启动服务
```powershell
C:\tools\nssm\nssm.exe start dashboard-api
```

5) 验证
```powershell
sc query dashboard-api
curl http://127.0.0.1:8787/health
curl https://ms.meaningful.ink/api/dashboard/health
```

---

## 8) 防火墙原则
- 公网只开放 80/443（Nginx）
- `8787` 不对公网开放（仅 127.0.0.1）
