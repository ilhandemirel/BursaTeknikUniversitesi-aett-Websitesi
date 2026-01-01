export const config = {
    matcher: '/:path*',
};

export default function middleware(request: Request) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Check if the request is coming from the old domain
    if (hostname === 'aett.vercel.app') {
        url.hostname = 'btuyildirim.com';
        return Response.redirect(url, 301);
    }
}
