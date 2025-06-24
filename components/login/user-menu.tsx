"use client";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const getInitial = (user: any) => {
  if (!user?.name && !user?.email) return "U";
  return (user?.name || user?.email || "U")[0].toUpperCase();
};

const UserMenu = () => {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading } =
    useAuth0();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => loginWithRedirect()}>
        登录
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-lg font-bold bg-blue-100 text-blue-600"
        >
          {getInitial(user)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
