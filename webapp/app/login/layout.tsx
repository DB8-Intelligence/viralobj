import { SiteShell } from "@/components/SiteShell";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
