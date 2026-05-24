"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/app/lib/cart-context";

const links = [
    { href: "/productos", label: "Productos" },
    { href: "/nosotros", label: "Nuestra Historia" },
    { href: "/seguimiento", label: "Mi Pedido" },
    { href: "/ayuda", label: "Ayuda" },
    { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { totalItems, hydrated } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-darker/50">
            <nav className="max-w-7xl mx-auto px-5 md:px-16 flex items-center justify-between h-16 md:h-20">
                <Link href="/" className="flex items-center group">
                    <Image
                        src="/images/logo.png"
                        alt="Mishkitashua"
                        width={140}
                        height={56}
                        className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                        className="-ml-2 text-xl md:text-2xl font-medium text-cocoa-deep tracking-tight"
                        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                        Mishkitashua
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-semibold tracking-wide transition-colors ${
                                pathname.startsWith(link.href)
                                    ? "text-caramel"
                                    : "text-cocoa-light hover:text-cocoa-deep"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/carrito"
                        className="relative p-2 text-cocoa-deep hover:text-caramel transition-colors"
                    >
                        <ShoppingBag size={22} />
                        {hydrated && totalItems > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-cocoa text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/productos"
                        className="hidden md:inline-flex bg-cocoa text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-cocoa-deep transition-colors"
                    >
                        Comprar Ahora
                    </Link>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-cocoa-deep"
                        aria-label="Menú"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className="md:hidden bg-cream border-t border-cream-darker">
                    <div className="px-5 py-4 space-y-3">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`block text-base font-medium py-2 ${
                                    pathname.startsWith(link.href)
                                        ? "text-caramel"
                                        : "text-cocoa-deep"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/productos"
                            onClick={() => setMenuOpen(false)}
                            className="block bg-cocoa text-white text-center text-sm font-semibold px-5 py-3 rounded-lg mt-2"
                        >
                            Comprar Ahora
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
