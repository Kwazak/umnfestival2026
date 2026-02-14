// resources/js/Components/Navbar.jsx
import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import logo from "../../images/logo_UMN_Festival_2025.svg";

export default function Navbar() {
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Event", href: "/event" },
        { label: "Merchandise", href: "/merchandise" },
        { label: "Ticket", href: "/ticket" },
        { label: "About Us", href: "/about" },
    ];

    return (
        <nav className="fixed w-[95%] lg:w-[90%] bg-[#FFC22F]/100 rounded-[50px] z-99 inset-x-0 mx-auto mt-8">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link href="/">
                    <img
                        src={logo}
                        alt="UMN Festival Logo"
                        className="h-12 w-auto lg:h-15"
                    />
                </Link>

                {/* Desktop menu */}
                <div className="hidden md:flex lg:space-x-7 md:space-x-2">
                    {navItems.map((item) => {
                        const isActive = url === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  relative text-[1.1em] transition lg:text-xl
                  ${
                      isActive
                          ? "text-[#281F65] font-bold"
                          : "text-[#281F65] font-medium"
                  }
                  hover:bg-[#FFDF84] leading-[25px] pl-[15px] pr-[15px] pt-[5px] pb-[5px] rounded-[5px] transition-colors duration-500
                `}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Hamburger button (mobile) */}
                <button
                    className="md:hidden flex flex-col justify-between w-6 h-6 focus:outline-none"
                    onClick={() => setOpen(!open)}
                >
                    <span
                        className={`block h-[3px] w-full bg-[#281F65] rounded transition-transform duration-300 ${
                            open ? "rotate-45 translate-y-[11px]" : ""
                        }`}
                    />
                    <span
                        className={`block h-[3px] w-full bg-[#281F65] rounded transition-opacity duration-300 ${
                            open ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                        className={`block h-[3px] w-full bg-[#281F65] rounded transition-transform duration-300 ${
                            open ? "-rotate-45 -translate-y-[9px]" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`
          md:hidden bg-[#FFC22F] px-6 overflow-hidden transition-all duration-300 rounded-[50px]
          ${open ? "max-h-60 py-4" : "max-h-0"}
        `}
            >
                <div className="flex flex-col space-y-2">
                    {navItems.map((item) => {
                        const isActive = url === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                    text-base px-2 py-1 transition
                    ${
                        isActive
                            ? "text-[#281F65] font-bold"
                            : "text-[#281F65] font-medium"
                    }
                    hover:bg-[#FFDF84] hover:rounded-[5px]
                `}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}