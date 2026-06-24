/**
 * Edge Middleware - 数据看板 API 鉴权
 * 只保护 /api/stats（dashboard.html 改为内部登录）
 */
export const config = {
    matcher: ['/api/stats'],
};

const DEFAULT_USER = 'sfhgxj';
const DEFAULT_PASS = 'SfH2026gxj';

function checkAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith('Basic ')) return false;
    try {
        const b64 = authHeader.slice(6);
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const decoded = new TextDecoder().decode(bin);
        const idx = decoded.indexOf(':');
        if (idx < 0) return false;
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        const expectU = process.env.AUTH_USER || DEFAULT_USER;
        const expectP = process.env.AUTH_PASS || DEFAULT_PASS;
        return u === expectU && p === expectP;
    } catch {
        return false;
    }
}

export default function middleware(req) {
    const auth = req.headers.get('authorization');
    if (checkAuth(auth)) {
        return new Response(null, { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="sfhgxj", charset="UTF-8"',
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}
