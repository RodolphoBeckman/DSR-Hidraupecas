"use client"

import Link from "next/link";
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AppSettings, UserInfo } from "@/lib/definitions";
import { useMounted } from "@/hooks/use-mounted";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const initialUserInfo: UserInfo = {
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    avatar: null,
}

export function UserNav() {
  const { setTheme } = useTheme();
  const hasMounted = useMounted();
  const [settings] = useLocalStorage<AppSettings>('app-settings', { userInfo: initialUserInfo, pixQrCode: null, headerImage: null, companyInfo: null, backgroundImage: null });

  const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar')!;
  const userInfo = settings.userInfo || initialUserInfo;
  const userAvatar = userInfo.avatar || avatarPlaceholder.imageUrl;

  if (!hasMounted) {
    return (
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt="Avatar do usuário" />
            <AvatarFallback>{userInfo.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userInfo.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem>
                Perfil
            </DropdownMenuItem>
          </Link>
           <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-2">Alternar Tema</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
           <Link href="/settings">
             <DropdownMenuItem>
                Configurações
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
