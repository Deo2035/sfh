/**
 * Edge Middleware - 数据看板 API 鉴权
 * 保护 /api/stats
 *
 * 安全设计：
 * - 使用 Bearer Token 模式（不是 Basic Auth）
 * - 客户端发送密码的 SHA-256 哈希，服务器比对哈希
 * - 哈希不能反推明文密码
 * - 通过 HTTPS 传输哈希，TLS 加密防截获
 */
export const config = {
    matcher: ['/api/stats'],
};

// 默认密码的 SHA-256 哈希（明文密码不存在于代码、注释、文档、页面的任何位置）
// 如需重置：SHA-256 计算方式 → 任意在线工具或 PowerShell: [BitConverter]::ToString(([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes('你的密码')))).Replace('-','').ToLower()
const DEFAULT_PASS_HASH = '893fa2376331b7c564d4e9fc06dee5d0cbb75a53678c2774fa7f5ed5f50bd2e5';

function checkAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const providedHash = authHeader.slice(7).trim();
    // SHA-256 哈希是 64 位十六进制字符串
    if (!/^[a-f0-9]{64}$/i.test(providedHash)) return false;
    const expectHash = (process.env.AUTH_PASS_HASH || DEFAULT_PASS_HASH).toLowerCase();
    return providedHash.toLowerCase() === expectHash;
}

export default function middleware(req) {
    const auth = req.headers.get('authorization');
    if (checkAuth(auth)) {
        return new Response(null, { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}
