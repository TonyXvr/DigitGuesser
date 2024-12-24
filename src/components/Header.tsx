import { useRouter } from 'next/router';
import Logo from './Logo';
import { Button } from './ui/button';
import { useProfile } from '@/contexts/ProfileContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const router = useRouter();
  const { user, signOut } = useProfile();

  const NavigationItems = () => (
    <>
      <Button
        variant="ghost"
        className="text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start"
        onClick={() => router.push("/")}
      >
        Home
      </Button>
      <Button
        variant="ghost"
        className="text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start"
        onClick={() => router.push("/leaderboard")}
      >
        Leaderboard
      </Button>
      <Button
        variant="ghost"
        className="text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start"
        onClick={() => router.push("/multiplayer")}
      >
        Multiplayer
      </Button>
      {user && (
        <>
          <Button
            variant="ghost"
            className="text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start"
            onClick={() => router.push("/account")}
          >
            Account
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Logo />
        </div>
        <nav className="hidden md:flex space-x-4">
          <NavigationItems />
        </nav>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden"
              size="icon"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 mt-6">
              <NavigationItems />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

export default Header;