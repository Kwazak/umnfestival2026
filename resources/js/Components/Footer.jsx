// resources/js/Components/Footer.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import logoFestival from "../../images/logo_UMN_Festival_2025.svg";
import logoBEM from "../../images/logo_BEM.webp";
import logoUMN from "../../images/logo_UMN.webp";

import facebookIcon from "../../images/icon-facebook.svg";
import instagramIcon from "../../images/icon-instagram.svg";
import gmailIcon from "../../images/icon-gmail.svg";
import youtubeIcon from "../../images/icon-youtube.svg";

export default function Footer() {
    const navSections = [
        {
            title: null,
            items: [
                { label: "Home", href: "/" },
                { label: "Ticket", href: "/ticket" },
            ],
        },
        {
            title: null,
            items: [
                { label: "Event", href: "/event" },
                { label: "About Us", href: "/about" },
            ],
        },
        {
            title: null,
            items: [{ label: "Merchandise", href: "/merchandise" }],
        },
    ];

    const socialLinks = [
        { icon: facebookIcon, alt: "Facebook", href: "#" },
        { icon: instagramIcon, alt: "Instagram", href: "#" },
        { icon: gmailIcon, alt: "Gmail", href: "#" },
        { icon: youtubeIcon, alt: "YouTube", href: "#" },
    ];

    return (
        <footer className="w-full z-10 mt-auto">
            {/* Bagian Atas: putih */}
            <div className="bg-white text-gray-800 pt-0 md:pt-8 pb-0 md:pb-4 ">
                <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 ">
                    {/* bagianAtasAtas */}
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                        {/* kiri: festival logo */}
                        <div className="flex-shrink-0">
                            <img
                                src={logoFestival}
                                alt="UMN Festival Logo"
                                className="h-20 w-auto"
                            />
                        </div>
                        {/* kanan: dua logo */}
                        <div className="flex gap-6">
                            <img
                                src={logoBEM}
                                alt="BEM Logo"
                                className="h-25 w-auto"
                            />
                            <img
                                src={logoUMN}
                                alt="UMN Logo"
                                className="h-26 w-auto"
                            />
                        </div>
                    </div>

                    {/* bagianAtasTengah */}
                    <div className="flex justify-center md:justify-start space-x-6 items-center">
                        {socialLinks.map((s, i) => (
                            <a
                                key={i}
                                href={s.href}
                                className="block hover:opacity-75 transition-opacity"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={s.icon} alt={s.alt} className="" />
                            </a>
                        ))}
                    </div>

                    {/* bagianAtasBawah */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-2 items-center">
                        {/* alamat */}
                        <div className="space-y-1 text-sm leading-relaxed text-center md:text-left">
                            <p>Universitas Multimedia Nusantara</p>
                            <p>Jl. Scientia Boulevard, Gading Serpong</p>
                            <p>Tangerang, Banten - 15811, Indonesia</p>
                        </div>
                        {/* daftar link */}
                        <div className="grid grid-cols-2 gap-2 text-base text-center md:text-left">
                            {navSections.map((section, idx) => (
                                <ul key={idx} className="space-y-2">
                                    {section.items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className="hover:text-blue-600 transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* bagianBawah: kuning */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 pt-[12px] pb-[23px]">
                    <p className="text-sm text-gray-800">
                        Copyright ©2025 UMN Festival Codex and Illusionist
                        Division
                    </p>
                </div>
            </div>
        </footer>
    );
}
