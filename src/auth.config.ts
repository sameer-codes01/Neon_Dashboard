import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')
            const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/signup')

            if (isOnAdmin) {
                if (!isLoggedIn) return false
                // Basic role check - detailed check happens in page/layout or server action
                // due to token availability in middleware
                const role = (auth.user as any)?.role
                if (role !== 'ADMIN') {
                    return Response.redirect(new URL('/dashboard', nextUrl))
                }
                return true
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            }

            if (isAuthPage && isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }

            return true
        },
        jwt({ token, user }) {
            console.log("JWT Callback: User:", user ? "Present" : "Absent", "Token:", JSON.stringify(token).substring(0, 50))
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            console.log("Session Callback: Token:", JSON.stringify(token).substring(0, 50))
            if (session.user) {
                if (token && typeof token === 'object') {
                    (session.user as any).role = (token as any).role;
                    (session.user as any).id = (token as any).id;
                } else {
                    console.error("Session Callback: Token is not an object!", token)
                }
            }
            return session
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
