"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Undo2 } from "lucide-react";
import style from "./style.module.css";

export default function NavBar() {
  const [navbar, setNavbar] = useState(false);

  const navRef = useRef<HTMLUListElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!navbar) return;

      const target = e.target as Node;

      const clickedInsideNav = navRef.current?.contains(target);
      const clickedOnButton = btnRef.current?.contains(target);

      if (!clickedInsideNav && !clickedOnButton) {
        setNavbar(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [navbar]);

  const closeNavbar = () => {
    setNavbar(false);
  };

  return (
    <>
      {/* دکمه همبرگری فقط موبایل */}
      <button
        ref={btnRef}
        aria-label="باز کردن منو"
        aria-expanded={navbar}
        onClick={() => setNavbar((prev) => !prev)}
        className={style.navbtn}
      >
        <Menu color="#a6009e" />
      </button>

      <ul
        ref={navRef}
        className={`${style.navbar} ${
          navbar ? style.navbarOpen : style.navbarClosed
        }`}
      >
        {/* هدر منو */}
        <li className={style.navhead}>

          {/* دکمه بستن فقط موبایل */}
          <button
            className={style.navbarbtn}
            onClick={closeNavbar}
            aria-label="بستن منو"
          >
            <Undo2 color="#fff" />
          </button>
        </li>

        {/* آیتم‌های منو */}
        <li className={style.navitem}>
          <a href="/">خانه</a>
        </li>

        <li className={style.navitem}>
          <a href="#address">آدرس</a>
        </li>

        <li className={style.navitem}>
          <a href="#support">پشتیبانی</a>
        </li>

        <li className={style.navitem}>
          <a href="#about">درباره ما</a>
        </li>
      </ul>
    </>
  );
}