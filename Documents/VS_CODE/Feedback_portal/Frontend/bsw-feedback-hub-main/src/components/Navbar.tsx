import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, MessageSquareText, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/50 bg-[#121826]/85 backdrop-blur supports-[backdrop-filter]:bg-[#121826]/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a936f] text-sm font-bold text-white shadow-sm">
            BSW
          </div>
          <span className="hidden text-base font-semibold tracking-tight text-white sm:inline">
            BSW Feedback Portal
          </span>
          <span className="text-base font-semibold tracking-tight text-white sm:hidden">
            Feedback
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <Button
              onClick={() => navigate({ to: "/login" })}
              className="bg-[#1a936f] text-white hover:bg-[#157a5b]"
            >
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-slate-700/70">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a936f] text-xs font-semibold">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="hidden max-w-[10rem] truncate sm:inline">
                    {user?.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-slate-700/60 bg-slate-800 text-white">
                <DropdownMenuLabel className="text-gray-300">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className="truncate text-xs text-gray-400">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700/60" />
                {user?.role === "user" && (
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/my-feedbacks" })}
                    className="cursor-pointer focus:bg-slate-700/60 focus:text-white"
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    My Feedbacks
                  </DropdownMenuItem>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/admin" })}
                    className="cursor-pointer focus:bg-slate-700/60 focus:text-white"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Admin Home
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => logout(navigate)}
                  className="cursor-pointer focus:bg-slate-700/60 focus:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
