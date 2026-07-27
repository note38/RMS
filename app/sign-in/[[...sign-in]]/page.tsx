import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {/* Branding above the Clerk card */}
      <div className="text-center space-y-2">
        <img
          src="/logo.png"
          alt="Provincial Government of Aurora"
          className="w-20 h-20 mx-auto object-contain"
        />
        <h1 className="text-xl font-bold text-foreground">MIS/CCTV Command Center</h1>
        <p className="text-sm text-muted-foreground">Provincial Government of Aurora</p>
      </div>

      {/* Clerk sign-in with Secured by Clerk footer hidden */}
      <SignIn
        fallbackRedirectUrl="/sync"
        signUpFallbackRedirectUrl="/sync"
        appearance={{
          elements: {
            footer:             "hidden",
            footerAction:       "hidden",
            footerActionLink:   "hidden",
            footerPages:        "hidden",
          },
        }}
      />
    </div>
  );
}
