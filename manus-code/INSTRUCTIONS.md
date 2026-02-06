// ============================================
// INSTRUCTIONS FOR YOUR MANUS PROJECT
// ============================================

## Step-by-Step Integration Guide

### Step 1: Create AuthContext.tsx
Location: `client/src/contexts/AuthContext.tsx`
- Copy the content from AuthContext.tsx file below
- This creates a React context for managing auth state

### Step 2: Create AuthHeader.tsx  
Location: `client/src/components/AuthHeader.tsx`
- Copy the content from AuthHeader.tsx file below
- This is the header component showing login button or user email

### Step 3: Update App.tsx
Location: `client/src/App.tsx`

Replace your current App.tsx with:

```tsx
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";  // ADD THIS
import Home from "./pages/Home";
import Success from "./pages/Success";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/success"} component={Success} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>  {/* ADD THIS WRAPPER */}
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>  {/* ADD THIS */}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Step 4: Update Home.tsx Header Section
Location: `client/src/pages/Home.tsx`

Add the AuthHeader to your page header. Find your header/navbar section and add:

```tsx
import { AuthHeader } from '@/components/AuthHeader';

// In your header section, add:
<header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Your logo */}
    <div className="flex items-center gap-3">
      <span className="text-xl font-bold text-gray-900">ScreenGrabber</span>
    </div>

    {/* Your nav links */}
    <nav className="hidden md:flex items-center gap-8">
      <a href="#how-to-use" className="text-gray-600 hover:text-orange-600">How to Use</a>
      <a href="#features" className="text-gray-600 hover:text-orange-600">Features</a>
      <a href="#pricing" className="text-gray-600 hover:text-orange-600">Pricing</a>
      <a href="#download" className="text-gray-600 hover:text-orange-600">Download</a>
    </nav>

    {/* AUTH HEADER - Shows login button or user email */}
    <AuthHeader />
  </div>
</header>
```

### Step 5: Update Pricing Section
Replace your existing pricing section with the PricingSection.tsx component:

```tsx
import { PricingSection } from '@/components/PricingSection';

// In your Home.tsx, replace the pricing section with:
<PricingSection />
```

---

## Summary of Files to Create/Modify:

### New Files:
1. `client/src/contexts/AuthContext.tsx` - Auth state management
2. `client/src/components/AuthHeader.tsx` - Login button / User dropdown
3. `client/src/components/PricingSection.tsx` - Updated pricing with auth

### Modified Files:
1. `client/src/App.tsx` - Add AuthProvider wrapper
2. `client/src/pages/Home.tsx` - Add AuthHeader to header, use PricingSection

---

## How Manus Auth Works:

Your Manus project uses OAuth authentication. When a user clicks "Sign In":
1. They are redirected to `/api/auth/login`
2. Manus handles the OAuth flow
3. User is redirected back and a session cookie is set
4. The `trpc.auth.me` query returns the user data

The AuthContext uses this existing flow - no backend changes needed!
