// 生成一个随机 UA
const version = Math.floor(Math.random() * 20 + 85); // 统一版本号
const agents = [
    {
        ua: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/${version}.0.0.0 Safari/537.36`,
        platform: `"Windows"`,
        secChUa: `"Google Chrome";v="${version}", "Chromium";v="${version}", "Not_A Brand";v="99"`
    },
    {
        ua: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_${Math.floor(Math.random() * 9 + 10)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
        platform: `"macOS"`,
        secChUa: `"Google Chrome";v="${version}", "Chromium";v="${version}", "Not_A Brand";v="99"`
    },
    {
        ua: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`,
        platform: `"Linux"`,
        secChUa: `"Google Chrome";v="${version}", "Chromium";v="${version}", "Not_A Brand";v="99"`
    }
];

export function setRandomUA(session: any) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    session.defaultSession.webRequest.onBeforeSendHeaders((details: any, callback: any) => {
        details.requestHeaders['Referer'] = new URL(details.url).origin // 只发送域名
        details.requestHeaders['User-Agent'] = agent.ua;
        details.requestHeaders['sec-ch-ua-platform'] = agent.platform;
        details.requestHeaders['sec-ch-ua'] = agent.secChUa;
        callback({requestHeaders: details.requestHeaders})
    })
}