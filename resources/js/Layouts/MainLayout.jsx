import React from "react";
import { Navbar, Footer } from "../Components";
import ErrorBoundary from "../Components/ErrorBoundary";
import ChatbotWidget from "../Components/Chatbot/ChatbotWidget";

export default function MainLayout({ children }) {
    return (
        <ErrorBoundary>
            <div className="min-h-screen font-museum font-medium flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                {/* Chatbot Widget - appears on all pages */}
                <ChatbotWidget />
            </div>
        </ErrorBoundary>
    );
}
