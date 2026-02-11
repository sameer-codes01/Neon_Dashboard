import { AISummarizer } from "@/components/dashboard/AISummarizer";
import { Bot, Sparkles } from "lucide-react";

export default function AISummarizerPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            AI YouTube Summarizer
                            <div className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Pro Feature
                            </div>
                        </h2>
                    </div>
                    <p className="text-slate-500 font-medium">Extract transcripts and generate structured study notes with Gemini AI.</p>
                </div>
            </div>

            <AISummarizer />
        </div>
    );
}
