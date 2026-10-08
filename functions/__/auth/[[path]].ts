interface EventContext {
  request: Request;
}

type PagesFunction = (context: EventContext) => Promise<Response>;

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const targetUrl = new URL(url.pathname + url.search, 'https://regal-aviary-8dckx.firebaseapp.com');

  const headers = new Headers(context.request.headers);
  headers.set('Host', 'regal-aviary-8dckx.firebaseapp.com');

  try {
    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response('Auth Handler Proxy Error', { status: 502 });
  }
};
