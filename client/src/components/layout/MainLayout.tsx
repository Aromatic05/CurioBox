import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import GlobalBackground from "../GlobalBackground";
import ThemeToggle from "../ThemeToggle";
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

function MainLayout() {
    // 主题状态，默认跟随系统
    const getSystemTheme = () =>
        window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    const [mode, setMode] = useState<"light" | "dark">(getSystemTheme());

    // 监听系统主题变化
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) =>
            setMode(e.matches ? "dark" : "light");
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // 主题对象
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );

    // 主题切换按钮回调
    const handleToggle = () =>
        setMode((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="min-h-screen flex flex-col">
                {/* 传递切换方法给 ThemeToggle，可选：ThemeToggle({mode, onToggle}) */}
                <ThemeToggle mode={mode} onToggle={handleToggle} />
                <GlobalBackground />
                <Navbar />
                <main className="flex-grow container mx-auto px-6 py-8">
                    <Outlet />
                </main>
                <footer className="footer-theme text-center py-4">
                    © 2025 CurioBox Project.
                </footer>
            </div>
        </ThemeProvider>
    );
}
export default MainLayout;
