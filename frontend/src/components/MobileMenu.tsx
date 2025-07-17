"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { isRTL } = useSettings();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Toggle menu"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {isOpen ? (
                        <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={toggleMenu}
                />

                {/* Menu Content */}
                <div
                    className={`absolute top-0 ${
                        isRTL ? 'left-0' : 'right-0'
                    } h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                        isOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
                    }`}
                >
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Menu</h2>
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                                aria-label="Close menu"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <nav className="space-y-4">
                            <Link
                                href="/"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={toggleMenu}
                            >
                                Home
                            </Link>
                            <Link
                                href="/settings"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={toggleMenu}
                            >
                                Settings
                            </Link>
                            <Link
                                href="/privacy"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={toggleMenu}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                onClick={toggleMenu}
                            >
                                Terms of Service
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
} 