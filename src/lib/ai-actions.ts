"use server";

import { YoutubeTranscript } from 'youtube-transcript';
import { YoutubeTranscript as YoutubeTranscriptPlus } from 'youtube-transcript-plus';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function extractTranscript(videoUrl: string) {
    try {
        console.log(`Extracting transcript for URL: ${videoUrl}`);

        let transcriptItems;
        try {
            transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
        } catch (primaryError) {
            console.warn("Primary extraction failed. Attempting fallback with youtube-transcript-plus...");
            try {
                transcriptItems = await YoutubeTranscriptPlus.fetchTranscript(videoUrl);
            } catch (fallbackError) {
                console.error("Fallback extraction also failed.");
                throw primaryError; // Re-throw the original error to be handled by the outer catch block
            }
        }

        const transcriptText = transcriptItems.map(item => item.text).join(" ");
        console.log(`Transcript extracted. Length: ${transcriptText.length} chars.`);
        console.log(`Preview: ${transcriptText.substring(0, 100)}...`);

        if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error("No transcript found. Please ensure the video has closed captions (CC) availble.");
        }

        return {
            success: true,
            transcript: transcriptText,
        };
    } catch (error: any) {
        console.error("Transcript extraction error:", error);

        let errorMessage = "Failed to extract transcript.";
        if (error.message.includes("Transcript is disabled")) {
            errorMessage = "Transcripts are disabled for this video.";
        } else if (error.message.includes("No transcript found")) {
            errorMessage = error.message;
        } else {
            errorMessage = "Could not retrieve transcript automatically. Please use a different video or try the 'Manual Text' tab to paste the transcript directly.";
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

const FALLBACK_MODELS = [
    "gemini-2.0-flash", // Verified available
    "gemini-2.0-flash-lite", // Verified available
    "gemini-flash-latest", // Verified available
    "gemini-pro-latest" // Verified available
];

export async function generateStudyNotes(transcript: string, mode: string) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            success: false,
            error: "Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file.",
        };
    }

    let success = false;
    let content = "";
    let lastError = "";

    for (const modelName of FALLBACK_MODELS) {
        try {
            console.log(`Attempting to generate content with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
        OBJECTIVE:
        Convert the provided YouTube video transcript into clean, accurate, well-structured study material.

        TRANSCRIPT:
        ${transcript}

        SELECTED MODE:
        ${mode}

        STRICT RULES (NON-NEGOTIABLE):
        - Use ONLY information explicitly present in the transcript.
        - Do NOT hallucinate missing details.
        - Keep language simple, precise, neutral, and student-friendly.
        - If any part of the transcript is unclear, incomplete, or lacks context, explicitly state the limitation.
        - Prioritize factual accuracy over completeness.
        - Adjust depth and detail ONLY based on the selected MODE: ${mode}.

        OUTPUT FORMAT (FOLLOW EXACTLY):

        TITLE:
        - One clear, concise, accurate title strictly based on the transcript.

        SUMMARY:
        - Direct explanation of what the video teaches.
        - No storytelling or background filler.

        KEY CONCEPTS:
        - List the main concepts discussed.
        - For each concept:
          - Concept Name
          - Explanation in 2–4 clear lines.

        DETAILED STUDY NOTES:
        - Clean bullet points and sub-points.
        - Follow the logical flow of the video.
        - Remove repetition, filler words, and spoken-language noise.
        - Notes must be exam-ready and editable by the user.

        IMPORTANT DEFINITIONS:
        - Include ONLY definitions explicitly explained in the transcript.
        - If none exist, write exactly: "No explicit definitions provided."

        EXAMPLES / CASE STUDIES:
        - Include ONLY examples or cases mentioned in the transcript.
        - Do NOT invent or expand examples.
        - If none exist, write exactly: "No examples mentioned."

        QUICK REVISION POINTS:
        - 5–10 sharp bullet points.
        - Facts only. No explanations.

        FLASHCARDS:
        - Term → Definition
        - Concept → Explanation
        - Use only transcript content.
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                success = true;
                content = text;
                break; // Exit loop on success
            }
        } catch (error: any) {
            console.error(`Error with model ${modelName}:`, error.message);
            lastError = error.message;
            // Continue to the next model in the fallback list
        }
    }

    if (success) {
        return {
            success: true,
            content: content,
        };
    } else {
        return {
            success: false,
            error: lastError || "Failed to generate study notes with any available model.",
        };
    }
}

export async function saveNote(title: string, content: string, videoUrl: string, mode: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to save notes." };
    }

    try {
        const note = await prisma.note.create({
            data: {
                title,
                content,
                videoUrl,
                mode,
                userId: session.user.id,
            },
        });

        return { success: true, note };
    } catch (error: any) {
        console.error("Save note error:", error);
        return { success: false, error: error.message || "Failed to save note." };
    }
}

export async function getSavedNotes() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to view notes." };
    }

    try {
        const notes = await prisma.note.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, notes };
    } catch (error: any) {
        console.error("Get notes error:", error);
        return { success: false, error: error.message || "Failed to fetch notes." };
    }
}

export async function deleteNote(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized." };
    }

    try {
        await prisma.note.delete({
            where: { id, userId: session.user.id },
        });

        return { success: true };
    } catch (error: any) {
        console.error("Delete note error:", error);
        return { success: false, error: error.message || "Failed to delete note." };
    }
}
