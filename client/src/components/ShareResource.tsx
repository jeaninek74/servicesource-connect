import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Share2, Link2, MessageSquare, Mail, Check } from "lucide-react";

interface ShareResourceProps {
  resourceName: string;
  resourceId: number;
}

export default function ShareResource({ resourceName, resourceId }: ShareResourceProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Build the canonical shareable URL from the current origin
  const shareUrl = `${window.location.origin}/resource/${resourceId}`;

  const shareText = `I found a resource that may help you: "${resourceName}" — check it out on ServiceSource Connect:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSMS = () => {
    const body = encodeURIComponent(`${shareText}\n${shareUrl}`);
    // sms: URI works on iOS and Android; opens the native SMS app
    window.open(`sms:?body=${body}`, "_blank");
    setOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Resource for you: ${resourceName}`);
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share a resource I found on ServiceSource Connect that may be helpful:\n\n"${resourceName}"\n\n${shareUrl}\n\nThis platform provides options, not professional advice. Always verify eligibility directly with the provider.\n\nTake care.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Share this resource
        </p>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center flex-shrink-0">
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Link2 className="w-4 h-4 text-[#1B2A4A]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {copied ? "Copied!" : "Copy Link"}
            </p>
            <p className="text-xs text-gray-400">Share the direct URL</p>
          </div>
        </button>

        {/* SMS */}
        <button
          onClick={handleSMS}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Send via Text</p>
            <p className="text-xs text-gray-400">Opens your SMS app</p>
          </div>
        </button>

        {/* Email */}
        <button
          onClick={handleEmail}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Send via Email</p>
            <p className="text-xs text-gray-400">Opens your email client</p>
          </div>
        </button>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 px-1 leading-relaxed">
            Sharing a link does not share any personal information.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
