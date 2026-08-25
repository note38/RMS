import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-12 flex-1 space-y-8">
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <Link
            href="/sign-in"
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you use the system, such as your name, email address, and the content of the requests you submit.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to process your requests, and to communicate with you about your account or our services.
          </p>

          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except as necessary to provide our services or when required by law.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
        </div>
      </div>
    </div>
  );
}
