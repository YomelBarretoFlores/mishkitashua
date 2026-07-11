"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, LayoutDashboard, Package } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/app/lib/cart-context";
import { UserButton, useUser } from "@clerk/nextjs";

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
    const { isSignedIn, user } = useUser();
    const isAdmin = user?.publicMetadata?.role === "admin";
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-darker/50">
            <nav className="max-w-7xl mx-auto px-5 md:px-16 flex items-center justify-between h-16 md:h-20">
                <Link href="/" className="flex items-center group">
                    <Image
                        src="/images/logo.png"
                        alt="Mishkitashua"
                        width={1280}
                        height={723}
                        priority
                        className="h-12 md:h-14 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                        className="-ml-2 text-xl md:text-2xl font-medium text-cocoa-deep tracking-tight"
                        style={{ fontFamily: "var(--font-eb-garamond), serif" }}
                    >
                        Mishkitashua
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-5 lg:gap-7">
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

                <div className="flex items-center gap-3">
                    <Link
                        href="/carrito"
                        className="relative p-2 text-cocoa-deep hover:text-caramel transition-colors"
                    >
                        <ShoppingBag size={22} />
                        <AnimatePresence>
                            {hydrated && totalItems > 0 && (
                                <motion.span
                                    key={totalItems}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 18,
                                    }}
                                    className="absolute -top-0.5 -right-0.5 bg-cocoa text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {!isSignedIn && (
                        <Link
                            href="/ingresar"
                            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa-light hover:text-cocoa-deep transition-colors"
                        >
                            <User size={16} />
                            Ingresar
                        </Link>
                    )}
                    {isSignedIn && (
                        <UserButton
                            appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                        >
                            <UserButton.MenuItems>
                                <UserButton.Link
                                    label="Mi cuenta"
                                    labelIcon={<User size={15} />}
                                    href="/cuenta"
                                />
                                <UserButton.Link
                                    label="Mis pedidos"
                                    labelIcon={<Package size={15} />}
                                    href="/cuenta/pedidos"
                                />
                                {isAdmin && (
                                    <UserButton.Link
                                        label="Panel de administración"
                                        labelIcon={<LayoutDashboard size={15} />}
                                        href="/admin"
                                    />
                                )}
                            </UserButton.MenuItems>
                        </UserButton>
                    )}

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
                        {!isSignedIn && (
                            <Link
                                href="/ingresar"
                                onClick={() => setMenuOpen(false)}
                                className="block text-base font-medium py-2 text-cocoa-deep"
                            >
                                Ingresar
                            </Link>
                        )}
                        {isSignedIn && (
                            <>
                                <Link
                                    href="/cuenta"
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-base font-medium py-2 text-cocoa-deep"
                                >
                                    Mi cuenta
                                </Link>
                                <Link
                                    href="/cuenta/pedidos"
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-base font-medium py-2 text-cocoa-deep"
                                >
                                    Mis pedidos
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setMenuOpen(false)}
                                        className="block text-base font-medium py-2 text-cocoa-deep"
                                    >
                                        Admin
                                    </Link>
                                )}
                            </>
                        )}
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
