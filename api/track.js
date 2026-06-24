import { kv } from '@vercel/kv';

// 接收访问追踪
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method not allowed' });
    }

    try {
        const { path: pagePath, referer, ua, screen } = req.body || {};

        if (!pagePath || typeof pagePath !== 'string' || pagePath.length > 200) {
            return res.status(400).json({ error: 'invalid path' });
        }

        // 排除看板自身
        if (pagePath.startsWith('/api/') || pagePath === '/dashboard.html' || pagePath === '/dashboard') {
            return res.status(200).json({ ok: true, skipped: true });
        }

        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const month = today.slice(0, 7);
        const year = today.slice(0, 4);

        // 解析客户端 IP（兼容 Vercel 代理）
        const ip = (
            req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.socket?.remoteAddress ||
            'unknown'
        ).toString().split(',')[0].trim().slice(0, 64) || 'unknown';

        const userAgent = (ua || req.headers['user-agent'] || 'unknown').slice(0, 200);
        const userId = simpleHash(ip + '|' + userAgent);

        // 总 PV
        await kv.incr('stats:total_pv');

        // 今日 PV
        await kv.incr(`stats:daily:${today}`);

        // 本月 PV
        await kv.incr(`stats:monthly:${month}`);

        // 本年 PV
        await kv.incr(`stats:yearly:${year}`);

        // 各页面访问量
        await kv.incr(`stats:pages:${pagePath}`);

        // 页面分类（财务分析 / 资质测评 / 其他）
        const category = classifyPage(pagePath);
        await kv.incr(`stats:category:${category}`);

        // UV：总去重集合 + 今日去重集合
        await kv.sadd('stats:uv_all', userId);
        await kv.sadd(`stats:uv_today:${today}`, userId);
        await kv.sadd(`stats:uv_monthly:${month}`, userId);

        // 最近访问记录
        const record = {
            time: now.toISOString(),
            path: pagePath,
            category,
            ip: ip.length > 24 ? ip.slice(0, 24) + '…' : ip,
            ua: userAgent.length > 80 ? userAgent.slice(0, 80) + '…' : userAgent,
            user: userId,
            device: parseDevice(userAgent),
            screen: screen || null,
        };
        await kv.lpush('stats:recent', JSON.stringify(record));
        await kv.ltrim('stats:recent', 0, 199); // 保留最近 200 条

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('track error:', err);
        return res.status(500).json({ error: 'internal' });
    }
}

function simpleHash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) + s.charCodeAt(i);
        h = h & h;
    }
    return 'u' + Math.abs(h).toString(36);
}

function classifyPage(path) {
    // 财务分析工具
    const finTools = ['111', '222', '333', '444', '555'];
    // 资质测评工具
    const quaTools = ['1gsqy', '3kjxzxqy', '4zjtxzxqy', '4zjtxxjr', '5.cxx', '6gfuhua', '6sfuhua', '7.gaoqi'];
    const seg = path.replace(/^\/+/, '').split('/')[0];
    if (finTools.includes(seg)) return '财务分析';
    if (quaTools.includes(seg)) return '资质测评';
    if (path === '/' || path === '/index.html') return '首页';
    return '其他';
}

function parseDevice(ua) {
    if (/mobile|android|iphone|ipod/i.test(ua)) return '移动';
    if (/ipad|tablet/i.test(ua)) return '平板';
    return 'PC';
}
