import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth?.user
    console.log("Middleware: Path:", req.nextUrl.pathname, "LoggedIn:", isLoggedIn, "Role:", (req.auth?.user as any)?.role)
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
