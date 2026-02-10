import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        console.log("Test DB Route: Attempting connection...");
        const userCount = await prisma.user.count();
        console.log("Test DB Route: Success! User count:", userCount);
        return NextResponse.json({ status: 'success', userCount, message: 'Database connection successful' });
    } catch (error: any) {
        console.error("Test DB Route: Connection failed:", error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
