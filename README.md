# 绥芬河市工业信息科技局服务平台

> 政府服务云平台 · 企业财务分析与资质测评工具集

## 部署方式：Vercel

### 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### 手动部署步骤

#### 1. 准备 Git 仓库
```bash
git init
git add .
git commit -m "init: 绥芬河市工业信息科技局服务平台"
git branch -M main
git remote add origin https://github.com/<your-account>/<repo>.git
git push -u origin main
```

#### 2. Vercel 导入
1. 登录 https://vercel.com
2. 点击 **Add New Project**
3. 选择刚创建的 GitHub 仓库
4. Framework Preset 选择 **Other**
5. 不需要 Build Command / Output Directory
6. 点击 **Deploy**

#### 3. 绑定自定义域名 `sfhgxj.ideallab.cn`
1. Vercel 项目 → Settings → Domains
2. 添加 `sfhgxj.ideallab.cn`
3. Vercel 会给出需要配置的 DNS 记录

#### 4. 配置 DNS（在域名注册商控制台）
Vercel 推荐使用 **CNAME** 记录（更灵活）：
| 主机记录 | 记录类型 | 记录值 |
|---|---|---|
| sfhgxj | CNAME | cname.vercel-dns.com |

> 如果域名是 @ 主域或不支持 CNAME，则改用 A 记录指向 `76.76.21.21`

#### 5. HTTPS
Vercel 会自动签发 Let's Encrypt 证书，DNS 生效后 1-2 分钟内自动启用 HTTPS。

## 目录结构
```
.
├── index.html              # 导航首页
├── vercel.json             # 部署配置
├── .gitignore
├── assets/
│   └── site-footer.js      # 统一底部（13 个子页面共享）
├── 111/                    # 偿债能力
├── 222/                    # 营运能力
├── 333/                    # 盈利能力
├── 444/                    # 盈利质量
├── 555/                    # 发展能力
├── 1gsqy/                  # 规上企业
├── 3kjxzxqy/               # 科技型中小企业
├── 4zjtxzxqy/              # 专精特新中小企业
├── 4zjtxxjr/               # 专精特新小巨人
├── 5.cxx/                  # 创新型中小企业
├── 6gfuhua/                # 国家级科技企业孵化器
├── 6sfuhua/                # 省级企业孵化器
└── 7.gaoqi/                # 高新技术企业
```

## 技术支持
- 公司：大连富乐达科技有限公司
- 邮箱：ideallab@163.com
