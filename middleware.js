/**
 * Edge Middleware - 数据看板鉴权
 * 保护 /dashboard.html 与 /api/stats
 */
export const config = {
    matcher: ['/dashboard.html', '/api/stats'],
};

function checkAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith('Basic ')) return false;
    try {
        // Edge runtime 中没有 atob，用 Uint8Array + TextDecoder 解码
        const b64 = authHeader.slice(6);
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const decoded = new TextDecoder().decode(bin);
        const idx = decoded.indexOf(':');
        if (idx < 0) return false;
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        return u === process.env.AUTH_USER && p === process.env.AUTH_PASS;
    } catch {
        return false;
    }
}

export default function middleware(req) {
    const auth = req.headers.get('authorization');
    if (checkAuth(auth)) {
        return new Response(null, { status: 200 });
    }
    return new Response('需要登录才能访问数据看板', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="绥芬河市工业信息科技局·数据看板", charset="UTF-8"',
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
