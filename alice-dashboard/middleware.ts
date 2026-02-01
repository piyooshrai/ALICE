export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/',
    '/projects/:path*',
    '/developers/:path*',
    '/analytics/:path*',
    '/guide/:path*',
  ]
}
