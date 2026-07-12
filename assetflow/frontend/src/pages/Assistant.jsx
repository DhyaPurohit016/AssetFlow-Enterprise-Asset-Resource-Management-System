import { useState } from "react";
import { MessageCircle, Sparkles, Send, HelpCircle, ArrowRight, Wrench, Building2, Box, ClipboardList } from "lucide-react";

const faqItems = [
    {
        question: "How do I register a new asset?",
        answer:
            "Visit Assets > Register Asset, complete the asset details such as name, category, location, serial number, and lifecycle status, then submit the form.",
    },
    {
        question: "How do I allocate an asset?",
        answer:
            "Go to the Allocation page, choose an available asset, select the employee or department, and confirm the allocation to update the inventory status.",
    },
    {
        question: "What does Under Maintenance mean?",
        answer:
            "Under Maintenance indicates the asset is temporarily unavailable while repairs or service are in progress. It cannot be allocated until returned to Available status.",
    },
    {
        question: "How do I update organization settings?",
        answer:
            "Open Organization Setup to manage departments, teams, and business units. This helps keep asset assignments aligned with your company structure.",
    },
    {
        question: "How do I find an asset by tag or serial?",
        answer:
            "Use the search field on the Assets page and type the asset tag, serial number, or keyword to quickly locate matching records.",
    },
];

const suggestions = [
    "How do I register a new asset?",
    "What is the maintenance workflow?",
    "How can I allocate equipment to a user?",
    "What does the dashboard show?",
    "How do I manage departments?",
];

function getAssistantResponse(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return "Please type a question about AssetFlow, such as asset registration, allocation, maintenance, or organization setup.";
    }

    if (/register|add.*asset|new asset|create asset/.test(normalized)) {
        return (
            "To register an asset, open the Assets page and click Register Asset. " +
            "Fill in the required fields and save. The new asset will appear in your inventory immediately."
        );
    }

    if (/allocate|assign|assignment|transfer/.test(normalized)) {
        return (
            "Allocation is handled on the Allocation page. Select the asset and the employee or department, " +
            "then confirm the allocation. The asset status updates automatically."
        );
    }

    if (/maintenance|repair|service|issue|broken/.test(normalized)) {
        return (
            "Assets marked Under Maintenance are unavailable for allocation until the maintenance request is closed. " +
            "Use the Maintenance page to raise requests, track progress, and return assets to service."
        );
    }

    if (/organization|department|team|business unit/.test(normalized)) {
        return (
            "Organization Setup lets you define departments and teams so assets and allocations can be tracked by business group. " +
            "Keep this structure up to date for accurate reporting and workflows."
        );
    }

    if (/dashboard|overview|charts|reports/.test(normalized)) {
        return (
            "The Dashboard provides a snapshot of available assets, allocations, maintenance status, bookings, and upcoming returns. " +
            "Use it to monitor capacity and identify what requires attention."
        );
    }

    if (/search|tag|serial|qr|code/.test(normalized)) {
        return (
            "Search on the Assets page using asset tag, serial number, or QR code data to locate inventory records quickly. " +
            "You can also filter by category or lifecycle status."
        );
    }

    if (/login|signup|password|auth|access/.test(normalized)) {
        return (
            "AssetFlow uses email and password authentication. If you forgot your password, use the Forgot Password flow to reset it. " +
            "Contact your administrator if your account needs permissions updates."
        );
    }

    if (/help|assistant|ai|chatbot|what is this|how do i use/.test(normalized)) {
        return (
            "This AI Assistant answers questions about AssetFlow features like assets, allocations, maintenance, and organization setup. " +
            "Type a natural question and I will guide you to the right page and workflow."
        );
    }

    return (
        "I can help with asset registration, allocation, maintenance, organization, and navigation within AssetFlow. " +
        "Try asking a specific question like “How do I allocate an asset?” or “What does Under Maintenance mean?”."
    );
}

export default function Assistant() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I’m AssetFlow’s AI Assistant. Ask me anything about assets, allocation, maintenance, organization setup, or navigation in the system.",
        },
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const userMessage = { role: "user", text: trimmed };
        const assistantMessage = { role: "assistant", text: getAssistantResponse(trimmed) };

        setMessages((current) => [...current, userMessage, assistantMessage]);
        setInput("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-sage-900 p-3">
                            <MessageCircle size={20} className="text-sage-400" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-sage-400 font-semibold">AI Assistant</p>
                            <h2 className="font-display font-semibold text-ink-50 text-2xl">Ask AssetFlow anything</h2>
                        </div>
                    </div>

                    <p className="text-sm text-ink-400 max-w-2xl">
                        The built-in AI Assistant is designed to guide you through AssetFlow workflows and answer questions fast. Ask about asset registration, allocation, maintenance, organization setup, or the platform layout.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                    setInput(suggestion);
                                }}
                                className="rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-left text-sm text-ink-200 hover:border-sage-500 hover:text-ink-50 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-1 text-sage-300 text-xs uppercase tracking-[0.18em]">Suggestion</div>
                                <div>{suggestion}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-surface-800 p-3">
                            <Sparkles size={18} className="text-sage-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-50">What this assistant knows</h3>
                            <p className="text-sm text-ink-400">
                                It provides helpful, workflow-aware answers about AssetFlow features and how to complete tasks in this system.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4 text-sm text-ink-300">
                            <div className="flex items-center gap-2 mb-2 text-sage-300">
                                <HelpCircle size={16} />
                                Navigation & usage
                            </div>
                            Search, page flow, and step-by-step answers.
                        </div>
                        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4 text-sm text-ink-300">
                            <div className="flex items-center gap-2 mb-2 text-sage-300">
                                <Wrench size={16} />
                                Maintenance guidance
                            </div>
                            Meaning of lifecycle statuses and how to raise maintenance requests.
                        </div>
                        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4 text-sm text-ink-300">
                            <div className="flex items-center gap-2 mb-2 text-sage-300">
                                <ClipboardList size={16} />
                                Asset workflows
                            </div>
                            Asset registration, allocation, search, and inventory best practices.
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
                <div className="card p-5 flex flex-col h-[660px]">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-full bg-sage-900 p-3">
                            <MessageCircle size={18} className="text-sage-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-50">Chat</h3>
                            <p className="text-sm text-ink-400">Type a question and get an instant answer from the AssetFlow knowledge base.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`rounded-3xl p-4 max-w-[90%] ${message.role === "assistant"
                                        ? "bg-surface-800 text-ink-200 self-start"
                                        : "bg-sage-950 text-ink-50 self-end"
                                    } ${message.role === "assistant" ? "ml-0" : "ml-auto"}`}
                            >
                                <div className="text-xs uppercase tracking-[0.24em] text-ink-500 mb-2">
                                    {message.role === "assistant" ? "AssetFlow AI" : "You"}
                                </div>
                                <div className="whitespace-pre-wrap text-sm leading-6">{message.text}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about asset registration, allocation, or maintenance..."
                            className="input flex-1"
                            aria-label="Ask the AI Assistant a question"
                        />
                        <button type="submit" className="btn-primary px-4 py-2">
                            <Send size={16} />
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="card p-5">
                        <h3 className="font-semibold text-ink-50 mb-3">Frequently asked questions</h3>
                        <div className="space-y-3">
                            {faqItems.map((item) => (
                                <div key={item.question} className="rounded-2xl border border-surface-700 bg-surface-900 p-4">
                                    <p className="text-sm font-medium text-ink-50">{item.question}</p>
                                    <p className="mt-2 text-sm text-ink-400">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="rounded-full bg-surface-800 p-3">
                                <ArrowRight size={18} className="text-sage-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-ink-50">Need faster answers?</h4>
                                <p className="text-sm text-ink-400">Start with one of the suggested questions or ask about a task you need to complete.</p>
                            </div>
                        </div>
                        <div className="grid gap-3 text-sm text-ink-300">
                            <p>“Where is my assigned laptop?”</p>
                            <p>“How do I mark an asset as returned?”</p>
                            <p>“Explain the maintenance workflow.”</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
