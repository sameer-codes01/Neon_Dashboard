"use server"

import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function signUp(prevState: any, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const roleInput = formData.get("role") as string || "USER"
    const role = roleInput.toUpperCase() === "ADMIN" ? "ADMIN" : "USER"

    if (!email || !password) {
        return { error: "Email and password are required" }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: "User already exists" }
        }

        const hashedPassword = await hash(password, 12)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                isApproved: false, // All users start unapproved
            },
        })

        return { success: "Account created! Please wait for admin approval.", error: null }
    } catch (error) {
        console.error("Signup error:", error)
        if ((error as any).code === 'P2002') {
            return { error: "User with this email already exists" }
        }
        return { error: `Registration failed: ${(error as Error).message}`, success: null }
    }
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        console.log("Login Action: Signing in...", email)
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        })
        console.log("Login Action: SignIn returned (unexpected if redirecting)")
    } catch (error) {
        console.log("Login Action: Caught error:", error)
        if (error instanceof AuthError) {
            if (error.cause?.err?.message === "APPROVAL_PENDING") {
                return { error: "Your account is pending approval by an admin." }
            }
            return { error: "Invalid email or password" }
        }
        throw error // Re-throw to allow Next.js redirect to work
    }
}
