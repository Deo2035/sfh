import { kv } from '@vercel/kv';

// 返回统计数据（需要 Basic Auth，由 middleware.js 保护）
export default async function handler(req, res) {
    // CORS（只允许同域）
    res.setHeader('Cache-Control', 'no-store');

    try {
        // 基础计数
        const [
            totalPv,
            totalUv,
            todayPvRaw,
            todayUvRaw,
            categoryFin,
            categoryQua,
            categoryIndex,
        ] = await Promise.all([
            kv.get('stats:total_pv'),
            kv.scard('stats:uv_all'),
            kv.get(`stats:daily:${todayStr()}`),
            kv.scard(`stats:uv_today:${todayStr()}`),
            kv.get('stats:category:财务分析'),
            kv.get('stats:category:资质测评'),
            kv.get('stats:category:首页'),
        ]);

        // 各页面访问量
        const pageKeys = await kv.keys('stats:pages:*');
        const pagesMap = {};
        for (const key of pageKeys) {
            const p = key.replace('stats:pages:', '');
            const v = await kv.get(key);
            if (v) pagesMap[p] = Number(v);
        }

        // 近 30 天趋势
        const trend = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            const pv = Number((await kv.get(`stats:daily:${d}`)) || 0);
            const uv = Number((await kv.scard(`stats:uv_today:${d}`)) || 0);
            trend.push({ date: d, pv, uv });
        }

        // 近 7/30 天独立用户
        const uv7 = await countRecentUv(7);
        const uv30 = await countRecentUv(30);

        // 月度趋势（最近 12 个月）
        const monthly = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toISOString().slice(0, 7);
            const pv = Number((await kv.get(`stats:monthly:${key}`)) || 0);
            monthly.push({ month: key, pv });
        }

        // 最近访问记录
        const recentRaw = await kv.lrange('stats:recent', 0, 49);
        const recent = recentRaw.map(s => {
            try { return JSON.parse(s); } catch { return null; }
        }).filter(Boolean);

        // 设备分布
        const deviceStats = { PC: 0, 移动: 0, 平板: 0, 其他: 0 };
        for (const r of recent) {
            if (r && r.device && deviceStats[r.device] !== undefined) {
                deviceStats[r.device]++;
            } else if (r) {
                deviceStats['其他']++;
            }
        }

        // 工具热度排行（过滤 /api 和 dashboard）
        const pagesRank = Object.entries(pagesMap)
            .filter(([p]) => !p.startsWith('/api') && p !== '/dashboard.html')
            .map(([path, pv]) => ({
                path,
                name: pathToName(path),
                category: classifyPageLocal(path),
                pv
            }))
            .sort((a, b) => b.pv - a.pv);

        // 上线天数（从首次部署时间计算；用 KV 中的 first_deploy 字段，未设置则用当前估算）
        const firstDeploy = (await kv.get('stats:first_deploy')) || null;
        const launchDays = firstDeploy
            ? Math.floor((Date.now() - Number(firstDeploy)) / 86400000) + 1
            : null;

        return res.status(200).json({
            summary: {
                totalPv: Number(totalPv || 0),
                totalUv: Number(totalUv || 0),
                todayPv: Number(todayPvRaw || 0),
                todayUv: Number(todayUvRaw || 0),
                uv7,
                uv30,
                launchDays,
                categoryFin: Number(categoryFin || 0),
                categoryQua: Number(categoryQua || 0),
                categoryIndex: Number(categoryIndex || 0),
            },
            pages: pagesMap,
            pagesRank,
            trend,
            monthly,
            recent,
            deviceStats,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('stats error:', err);
        return res.status(500).json({ error: 'internal', message: String(err.message || err) });
    }
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

async function countRecentUv(days) {
    const ids = new Set();
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const arr = await kv.smembers(`stats:uv_today:${d}`);
        for (const id of arr) ids.add(id);
    }
    return ids.size;
}

function classifyPageLocal(path) {
    const finTools = ['111', '222', '333', '444', '555'];
    const quaTools = ['1gsqy', '3kjxzxqy', '4zjtxzxqy', '4zjtxxjr', '5.cxx', '6gfuhua', '6sfuhua', '7.gaoqi'];
    const seg = path.replace(/^\/+/, '').split('/')[0];
    if (finTools.includes(seg)) return '财务分析';
    if (quaTools.includes(seg)) return '资质测评';
    if (path === '/' || path === '/index.html') return '首页';
    return '其他';
}

function pathToName(path) {
    const map = {
        '/': '平台首页',
        '/index.html': '平台首页',
        '/111/debt_analysis.html': '偿债能力分析',
        '/222/financial_analysis.html': '营运能力分析',
        '/333/profitability_analysis.html': '盈利能力分析',
        '/444/profitability_analysis.html': '盈利质量分析',
        '/555/finance_growth_analysis.html': '发展能力分析',
        '/1gsqy/survey.html': '规上企业自测',
        '/3kjxzxqy/assessment.html': '科技型中小企业自测',
        '/4zjtxzxqy/survey.html': '专精特新中小企业自测',
        '/4zjtxxjr/survey.html': '专精特新小巨人自测',
        '/5.cxx/survey.html': '创新型中小企业自测',
        '/6gfuhua/survey.html': '国家级科技企业孵化器自测',
        '/6sfuhua/survey.html': '省级企业孵化器自测',
        '/7.gaoqi/index.html': '高新技术企业自测',
    };
    return map[path] || path;
}
