import { useState } from "react";
import { ChevronDown, RotateCcw, Play } from "lucide-react";
import { promptModules } from "../../Data/promptData";

export default function PromptManager() {
    const [selectedModule, setSelectedModule] = useState(promptModules[0]);
    const [prompt, setPrompt] = useState(promptModules[0].prompt);
    const [testPrompt, setTestPrompt] = useState("");

    const handleSelect = (module) => {
        setSelectedModule(module);
        setPrompt(module.prompt);
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
            <div className="flex min-h-screen">
                {/* LEFT PANEL */}
                <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-4">
                            PROMPT MODULES
                        </h2>

                        <div className="space-y-1">
                            {promptModules.map((module) => {
                                const isActive = selectedModule.id === module.id;
                                return (
                                    <button
                                        key={module.id}
                                        onClick={() => handleSelect(module)}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {module.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                    {selectedModule.moduleTag}
                                </span>
                                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                                    {selectedModule.title}
                                </h1>
                            </div>

                            <button className="border border-slate-200 bg-white rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-sm hover:bg-slate-50">
                                {selectedModule.version}
                                <ChevronDown size={14} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Prompt Editor */}
                        <div className="bg-[#0b1329] rounded-2xl p-6 shadow-sm mb-6">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-[360px] bg-transparent resize-none outline-none text-slate-200 font-mono text-sm leading-relaxed"
                            />
                        </div>

                        {/* Test Prompt Box */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Test Prompt
                                </h3>
                                <button className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition">
                                    <Play size={12} fill="currentColor" />
                                    Run Preview
                                </button>
                            </div>

                            <textarea
                                value={testPrompt}
                                onChange={(e) => setTestPrompt(e.target.value)}
                                placeholder="Paste a sample transcript here to preview the AI's output..."
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 h-20 resize-none text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Bottom Buttons */}
                        <div className="flex justify-end gap-3">
                            <button className="border border-slate-200 bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-1.5">
                                <RotateCcw size={13} />
                                Rollback
                            </button>

                            <button className="border border-slate-200 bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50">
                                Save draft
                            </button>

                            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm">
                                Publish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}