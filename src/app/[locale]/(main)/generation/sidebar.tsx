"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronRight, ChevronLeft, Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import ExampleModal from "@/components/shared/example-modal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// This is a mock of your 70+ routes
// You should replace this with your actual routes
const menuItems = [
  {
    id: "realistic_photo",
    label: "realistic_photo",
    path: "/generation/basic",
  },
  {
    id: "english_cards",
    label: "english_cards",
    path: "/generation/english-cards",
  },
  {
    id: "visual_recipe",
    label: "visual_recipe",
    path: "/generation/visual-recipe",
  },
  {
    id: "physical_destruction",
    label: "physical_destruction",
    path: "/generation/physical-destruction",
  },
  {
    id: "product_model",
    label: "product_model",
    path: "/generation/product-model",
  },
  {
    id: "sculpture",
    label: "sculpture",
    path: "/generation/sculpture",
  },
  {
    id: "relief",
    label: "relief",
    path: "/generation/relief",
  },
  {
    id: "3d_head_pose",
    label: "3d_head_pose",
    path: "/generation/3d-head-pose",
  },
  {
    id: "clay_model",
    label: "clay_model",
    path: "/generation/clay-model",
  },
  {
    id: "crystal_ball",
    label: "crystal_ball",
    path: "/generation/crystal-ball",
  },
  {
    id: "passport_stamp",
    label: "passport_stamp",
    path: "/generation/passport-stamp",
  },
  {
    id: "low_poly",
    label: "low_poly",
    path: "/generation/low-poly",
  },
  {
    id: "isometric_scene",
    label: "isometric_scene",
    path: "/generation/isometric-scene",
  },
  {
    id: "city_isometric_view",
    label: "city_isometric_view",
    path: "/generation/city-isometric-view",
  },
  {
    id: "font_typography",
    label: "font_typography",
    path: "/generation/font-typography",
  },
  {
    id: "ancient_book",
    label: "ancient_book",
    path: "/generation/ancient-book",
  },
  {
    id: "pill_capsule",
    label: "pill_capsule",
    path: "/generation/pill-capsule",
  },
  {
    id: "keycap",
    label: "keycap",
    path: "/generation/keycap",
  },
  {
    id: "mini_3d_building",
    label: "mini_3d_building",
    path: "/generation/mini-3d-building",
  },
  {
    id: "change_age",
    label: "change_age",
    path: "/generation/change-age",
  },
  {
    id: "doll",
    label: "doll",
    path: "/generation/doll",
  },
  {
    id: "3d_model",
    label: "3d_model",
    path: "/generation/3d-model",
  },
  {
    id: "tweet",
    label: "tweet",
    path: "/generation/tweet",
  },
  {
    id: "double_exposure",
    label: "double_exposure",
    path: "/generation/double-exposure",
  },
  {
    id: "hand_drawn_info_card",
    label: "hand_drawn_info_card",
    path: "/generation/hand-drawn-info-card",
  },
  {
    id: "lego_collection",
    label: "lego_collection",
    path: "/generation/lego-collection",
  },
  {
    id: "micro_world",
    label: "micro_world",
    path: "/generation/micro-world",
  },
  {
    id: "cute_enamelled_pin",
    label: "cute_enamelled_pin",
    path: "/generation/cute-enamelled-pin",
  },
  {
    id: "q_version_3d_character",
    label: "q_version_3d_character",
    path: "/generation/q-version-3d-character",
  },
  {
    id: "ghibli_style",
    label: "ghibli_style",
    path: "/generation/ghibli-style",
  },
  {
    id: "sticker_design",
    label: "sticker_design",
    path: "/generation/sticker-design",
  },
  {
    id: "emoji_generator",
    label: "emoji_generator",
    path: "/generation/emoji-generator",
  },
  {
    id: "handwriting_note",
    label: "handwriting_note",
    path: "/generation/handwriting-note",
  },
  {
    id: "super_realistic_figure",
    label: "super_realistic_figure",
    path: "/generation/super-realistic-figure",
  },
  {
    id: "cloud_art",
    label: "cloud_art",
    path: "/generation/cloud-art",
  },
  {
    id: "brand_pill",
    label: "brand_pill",
    path: "/generation/brand-pill",
  },
  {
    id: "letter_box",
    label: "letter_box",
    path: "/generation/letter-box",
  },
  {
    id: "original_product_image",
    label: "original_product_image",
    path: "/generation/original-product-image",
  },
  {
    id: "plastic_trash_bag",
    label: "plastic_trash_bag",
    path: "/generation/plastic-trash-bag",
  },
  {
    id: "mini_scroll",
    label: "mini_scroll",
    path: "/generation/mini-scroll",
  },
  {
    id: "shadow_art",
    label: "shadow_art",
    path: "/generation/shadow-art",
  },
  {
    id: "cover_poster",
    label: "cover_poster",
    path: "/generation/cover-poster",
  },
  {
    id: "mini_tilt_shift_landscape",
    label: "mini_tilt_shift_landscape",
    path: "/generation/mini-tilt-shift-landscape",
  },
  {
    id: "q_version_keycap",
    label: "q_version_keycap",
    path: "/generation/q-version-keycap",
  },
  {
    id: "mini_3d_shop",
    label: "mini_3d_shop",
    path: "/generation/mini-3d-shop",
  },
  {
    id: "finger_nail_painting",
    label: "finger_nail_painting",
    path: "/generation/finger-nail-painting",
  },
  {
    id: "t_shirt_pin",
    label: "t_shirt_pin",
    path: "/generation/t-shirt-pin",
  },
  {
    id: "lego_city_landmark",
    label: "lego_city_landmark",
    path: "/generation/lego-city-landmark",
  },
  {
    id: "word_and_graphic_fusion",
    label: "word_and_graphic_fusion",
    path: "/generation/word-and-graphic-fusion",
  },
  {
    id: "3d_chrome_badge",
    label: "3d_chrome_badge",
    path: "/generation/3d-chrome-badge",
  },
  {
    id: "animal_landmark_selfie",
    label: "animal_landmark_selfie",
    path: "/generation/animal-landmark-selfie",
  },
  {
    id: "custom_anime_figure",
    label: "custom_anime_figure",
    path: "/generation/custom-anime-figure",
  },
  {
    id: "glass_effect",
    label: "glass_effect",
    path: "/generation/glass-effect",
  },
  {
    id: "rusty_iron_plate",
    label: "rusty_iron_plate",
    path: "/generation/rusty-iron-plate",
  },
  {
    id: "flowing_ink",
    label: "flowing_ink",
    path: "/generation/flowing-ink",
  },
  {
    id: "neon_graffiti",
    label: "neon_graffiti",
    path: "/generation/neon-graffiti",
  },
  {
    id: "grab_machine",
    label: "grab_machine",
    path: "/generation/grab-machine",
  },
  {
    id: "creative_minimalist_ad",
    label: "creative_minimalist_ad",
    path: "/generation/creative-minimalist-ad",
  },
  {
    id: "glass_fragment",
    label: "glass_fragment",
    path: "/generation/glass-fragment",
  },
  {
    id: "creative_drawstring_bag",
    label: "creative_drawstring_bag",
    path: "/generation/creative-drawstring-bag",
  },
  {
    id: "flower_sculpture",
    label: "flower_sculpture",
    path: "/generation/flower-sculpture",
  },
  {
    id: "succulent_pot",
    label: "succulent_pot",
    path: "/generation/succulent-pot",
  },
  {
    id: "retro_science_fiction_book_cover",
    label: "retro_science_fiction_book_cover",
    path: "/generation/retro-science-fiction-book-cover",
  },
  {
    id: "coin",
    label: "coin",
    path: "/generation/coin",
  },
  {
    id: "emotion_cake",
    label: "emotion_cake",
    path: "/generation/emotion-cake",
  },
  {
    id: "balloon",
    label: "balloon",
    path: "/generation/balloon",
  },
  {
    id: "monster_letter",
    label: "monster_letter",
    path: "/generation/monster-letter",
  },
  {
    id: "toy_box_city",
    label: "toy_box_city",
    path: "/generation/toy-box-city",
  },
  {
    id: "threeD_people",
    label: "threeD_people",
    path: "/generation/threeD-people",
  },
  {
    id: "flat_lay_photo",
    label: "flat_lay_photo",
    path: "/generation/flat-lay-photo",
  },
  {
    id: "cartoon_to_real",
    label: "cartoon_to_real",
    path: "/generation/cartoon-to-real",
  },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("sidebar");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);

  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Function to find scrollable element
  const findScrollableElement = () => {
    if (!sidebarRef.current) return null;
    return sidebarRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
  };

  // Preserve scroll position when pathname changes
  useEffect(() => {
    const restoreScrollPosition = () => {
      setTimeout(() => {
        const scrollableElement = findScrollableElement();
        if (scrollableElement) {
          scrollableElement.scrollTop = scrollPosRef.current;
          isNavigatingRef.current = false;
        }
      }, 200); // Ensure enough time for rendering
    };

    restoreScrollPosition();
  }, [pathname]);

  // Initial load - get saved position
  useEffect(() => {
    const savedPosition = localStorage.getItem("sidebarScrollPosition");
    if (savedPosition) {
      scrollPosRef.current = parseInt(savedPosition, 10);
    }
  }, []);

  // Custom Link component that sets navigation flag
  const NavLink = ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string | { pathname: string };
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => {
    const handleClick = () => {
      isNavigatingRef.current = true;
      // Save current scroll position right before navigation
      const scrollableElement = findScrollableElement();
      if (scrollableElement) {
        scrollPosRef.current = scrollableElement.scrollTop;
        localStorage.setItem(
          "sidebarScrollPosition",
          scrollPosRef.current.toString()
        );
      }
      // Call original onClick if provided
      if (onClick) onClick();
    };

    // Convert string href to object if it's a string
    const linkHref = typeof href === "string" ? { pathname: href } : href;

    return (
      <Link href={linkHref} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to check if a route is active, considering locale in the URL
  const isRouteActive = (routePath: string) => {
    return pathname.endsWith(routePath);
  };

  // Mobile menu with drawer
  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 md:hidden"
        >
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
        <SheetHeader className="border-b p-4">
          {/* <SheetTitle>{t("menu")}</SheetTitle> */}
        </SheetHeader>
        <ScrollArea className="h-full">
          <div className="p-2 pb-10">
            <NavLink
              href={`/${locale}/`}
              onClick={() => setIsOpen(false)}
              className="mb-3 flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Home size={16} className="mr-2" />
              <span className="flex-grow text-left">{t("home")}</span>
            </NavLink>
            <div className="my-2 border-t"></div>
            {menuItems.map((item) => {
              const isActive = isRouteActive(item.path);
              return (
                <NavLink
                  key={item.id}
                  href={`/${locale}${item.path}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "mb-1 flex w-full items-center rounded-md px-3 py-2 text-sm",
                    "transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground"
                  )}
                >
                  <span className="flex-grow text-left">{t(item.label)}</span>
                  {isActive && <Check size={16} className="text-primary" />}
                </NavLink>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div
      className={cn(
        "relative hidden h-full flex-col border-r bg-background transition-all duration-300 md:flex",
        isExpanded ? "w-[240px]" : "w-[60px]"
      )}
      ref={sidebarRef}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-4 top-20 z-10 h-8 w-8 rounded-full border bg-background shadow-sm"
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </Button>

      <ScrollArea className="h-[calc(100vh-200px)] pt-2" scrollHideDelay={0}>
        <div className="p-2">
          {isExpanded ? (
            <NavLink
              href={`/${locale}/`}
              className="mb-3 flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Home size={16} className="mr-2" />
              <span className="flex-grow text-left">{t("home")}</span>
            </NavLink>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    href={`/${locale}/`}
                    className="mb-3 flex w-full items-center justify-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Home size={20} />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("home")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="my-2 border-t"></div>
          {menuItems.map((item) => {
            const isActive = isRouteActive(item.path);

            return isExpanded ? (
              <NavLink
                key={item.id}
                href={`/${locale}${item.path}`}
                className={cn(
                  "mb-1 flex w-full items-center rounded-md px-3 py-2 text-sm",
                  "transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground"
                )}
              >
                <span className="flex-grow text-left">{t(item.label)}</span>
                {isActive && <Check size={16} className="text-primary" />}
              </NavLink>
            ) : (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      href={`/${locale}${item.path}`}
                      className={cn(
                        "mb-1 flex w-full items-center justify-center rounded-md p-2",
                        "transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground"
                      )}
                    >
                      <span className="text-xs">{t(item.label).charAt(0)}</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{t(item.label)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <ExampleModal />
      </ScrollArea>
    </div>
  );

  return (
    <>
      <MobileMenu />
      <DesktopSidebar />
    </>
  );
};

export default Sidebar;
