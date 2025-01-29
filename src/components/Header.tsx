import { useRouter } from 'next/router';
import Logo from './Logo';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  const NavigationItems = () => (
    <>
      <Button
        variant={isActive("/single-player") ? "secondary" : "ghost"}
        className={`text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start ${
          isActive("/single-player") ? "bg-secondary" : ""
        }`}
        onClick={() => router.push("/single-player")}
      >
        Singleplayer
      </Button>
      <Button
        variant={isActive("/multiplayer") ? "secondary" : "ghost"}
        className={`text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start ${
          isActive("/multiplayer") ? "bg-secondary" : ""
        }`}
        onClick={() => router.push("/multiplayer")}
      >
        Multiplayer
      </Button>
      <Button
        variant={isActive("/leaderboard") ? "secondary" : "ghost"}
        className={`text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start ${
          isActive("/leaderboard") ? "bg-secondary" : ""
        }`}
        onClick={() => router.push("/leaderboard")}
      >
        Leaderboard
      </Button>
      <Button
        variant={isActive("/chatbot") ? "secondary" : "ghost"}
        className={`text-foreground hover:text-primary hover:bg-primary/10 w-full justify-start ${
          isActive("/chatbot") ? "bg-secondary" : ""
        }`}
        onClick={() => router.push("/chatbot")}
      >
        AI Assistant
      </Button>
    </>
  );

  return (
    <div className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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