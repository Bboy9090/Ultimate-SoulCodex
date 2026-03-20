import { redirect } from "next/navigation"
export default function RootPage() {
  // New users go to onboarding; returning users go to home
  // Client-side redirect logic is handled in the home page
  redirect("/home")
}
