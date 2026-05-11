import { StoreNavbar } from '@/components/shared/store-navbar';
import { StoreFooter } from '@/components/shared/store-footer';
import { AuthProvider } from '@/lib/auth-context';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <StoreNavbar />
        <main className="flex-1 pt-[72px]">{children}</main>
        <StoreFooter />
      </div>
    </AuthProvider>
  );
}
