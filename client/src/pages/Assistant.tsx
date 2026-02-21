import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import {
  Bot,
  Send,
  User,
  AlertTriangle,
  Phone,
  MessageSquare,
  Loader2,
  Shield,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  hasCrisisIndicator?: boolean;
  crisisResources?: { name: string; phone: string; text: string; chat: string }[];
}

const SUGGESTED_PROMPTS = [
  "I'm a veteran in Texas looking for housing assistance",
  "I need mental health support for PTSD",
  "What education benefits am I eligible for as a Guard member?",
  "I'm transitioning out of the military and need job help",
  "My family needs childcare assistance near a base",
  "I'm struggling financially and need emergency help",
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.assistant.chat.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        message: messageText,
        conversationHistory: messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: typeof result.message === "string" ? result.message : String(result.message),
        hasCrisisIndicator: result.hasCrisisIndicator,
        crisisResources: result.crisisResources,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an issue. Please try again, or browse our resource directory directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#C8A84B] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#1B2A4A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Resource Navigator</h1>
              <p className="text-blue-200 text-sm">
                Describe your situation in plain language — I'll help find the right support
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="border-blue-300 text-blue-200 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Privacy-first
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-200 text-xs">
              Powered by AI
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-200 text-xs">
              340+ verified resources
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="py-3 px-4">
            <p className="text-amber-800 text-sm">
              <strong>Disclaimer:</strong> This AI assistant provides general resource guidance only — not professional
              legal, medical, or financial advice. Always verify eligibility and details directly with each provider.
              Language such as "may qualify" and "you might be eligible" reflects this guidance, not a guarantee.
            </p>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="shadow-lg border-0 mb-4">
          <CardContent className="p-0">
            <div className="h-[480px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-[#1B2A4A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mb-6">
                    Tell me about your situation — your military status, location, and what kind of support you're
                    looking for. I'll search our database of 340+ verified resources to find the best matches.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-left text-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-[#1B2A4A] hover:bg-[#1B2A4A]/5 transition-colors text-gray-600"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-[#1B2A4A] text-white rounded-tr-sm"
                            : "bg-gray-100 text-gray-800 rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none">
                            <Streamdown>{String(msg.content)}</Streamdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}

                        {/* Crisis Banner */}
                        {msg.hasCrisisIndicator && msg.crisisResources && msg.crisisResources.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-red-700 font-semibold text-sm">
                                Immediate Support Available
                              </span>
                            </div>
                            {msg.crisisResources.map((cr) => (
                              <div key={cr.name} className="text-sm text-red-700 space-y-1">
                                <p className="font-medium">{cr.name}</p>
                                <p className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> Call or text: <strong>{cr.phone}</strong>
                                </p>
                                <p className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> Text: <strong>{cr.text}</strong>
                                </p>
                                <a
                                  href={cr.chat}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-red-600"
                                >
                                  Chat online →
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching resources...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your situation or ask a question... (Press Enter to send)"
                  className="resize-none min-h-[60px] max-h-[120px] flex-1"
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#1B2A4A] hover:bg-[#2a3f6f] h-10 w-10 p-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  {messages.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearConversation}
                      className="h-10 w-10 p-0"
                      title="Clear conversation"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to send · Shift+Enter for new line ·{" "}
                <span className="text-red-500 font-medium">Crisis? Call 988 (press 1)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
          <Link href="/resources" className="hover:text-[#1B2A4A] transition-colors">
            Browse All Resources →
          </Link>
          <Link href="/lenders" className="hover:text-[#1B2A4A] transition-colors">
            VA Lender Directory →
          </Link>
          <Link href="/crisis" className="hover:text-red-600 transition-colors font-medium">
            Crisis Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
