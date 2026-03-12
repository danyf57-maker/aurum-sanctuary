"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "./auth-dialog";
import { signOut } from "@/lib/firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref } from "@/lib/i18n/path";
import { useTranslations } from "next-intl";

export function AuthButton() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("authButton");
  const to = (href: string) => localizeHref(href, locale);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: t("signedOut") });
    router.push(to("/"));
  };

  if (loading) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  if (user) {
    const userInitial =
      user.displayName ?? "" ? (
        (user.displayName ?? "").charAt(0).toUpperCase()
      ) : (
        <UserIcon className="h-4 w-4" />
      );
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.photoURL ?? ""}
                alt={(user.displayName ?? "") || t("userAlt")}
              />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName ?? ""}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={to("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
              <span>{t("settings")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("signOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsAuthDialogOpen(true)}
        className="bg-stone-600 text-white hover:bg-stone-700"
      >
        {t("signIn")}
      </Button>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
