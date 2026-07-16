import type { Locale } from "./i18n-core";

export const shellMessages = {
  zh: {
    nav: {
      brand: "Meaningful · Ink",
      items: [
        { href: "/projects", label: "作品" },
        { href: "/blog", label: "文章" },
        { href: "/about", label: "关于" },
        { href: "/contact", label: "联系" }
      ],
      enter: "进入",
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文"
    },
    theme: {
      light: "亮色",
      dark: "暗色",
      switchToLight: "切换到亮色",
      switchToDark: "切换到暗色"
    },
    footer: {
      copyright: "© 2026 Meaningful · Ink",
      tagline: "AI 产品 · 全栈工程 · 独立创作"
    }
  },
  en: {
    nav: {
      brand: "Meaningful · Ink",
      items: [
        { href: "/projects", label: "Work" },
        { href: "/blog", label: "Writing" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" }
      ],
      enter: "Enter",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode"
    },
    footer: {
      copyright: "© 2026 Meaningful · Ink",
      tagline: "AI products · Full-stack engineering · Independent making"
    }
  }
} as const;

export type ShellMessages = (typeof shellMessages)[Locale];

export const getShellMessages = (locale: Locale): ShellMessages => shellMessages[locale];
