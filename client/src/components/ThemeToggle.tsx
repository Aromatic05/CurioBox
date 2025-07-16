import React, { useEffect, useState } from "react";

interface ThemeToggleProps {
    mode?: "light" | "dark";
    onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
    // 如果受控则用props，否则用本地状态
    const isControlled =
        typeof mode === "string" && typeof onToggle === "function";
    const [localTheme, setLocalTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined") {
            return document.documentElement.classList.contains("theme-light")
                ? "light"
                : "dark";
        }
        return "dark";
    });
    const theme = isControlled ? mode! : localTheme;

    useEffect(() => {
        document.documentElement.classList.remove("theme-light", "theme-dark");
        document.documentElement.classList.add(
            theme === "light" ? "theme-light" : "theme-dark",
        );
    }, [theme]);

    const handleClick = () => {
        if (isControlled) {
            if (onToggle) onToggle();
        } else {
            setLocalTheme((prev) => (prev === "dark" ? "light" : "dark"));
        }
    };

    return (
        <button
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 1000,
                padding: "10px 22px",
                borderRadius: "24px",
                border: "none",
                background: theme === "dark" ? "#232526" : "#f8fffa",
                color: theme === "dark" ? "#f8fffa" : "#232526",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s",
            }}
            onClick={handleClick}
            aria-label="切换主题"
        >
            {theme === "dark" ? "🌙 暗色" : "☀️ 亮色"}
        </button>
    );
};

export default ThemeToggle;
