import React from "react";

const EMAIL = "muhammad.ichsan03@ar-raniry.ac.id";
const EMAIL_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent(
    "Minat terhadap Aplikasi IDC"
)}`;

const DeveloperCredit = ({ variant = "light", className = "" }) => {
    const isDark = variant === "dark";
    const baseText = isDark
        ? "text-gray-400"
        : "text-gray-500 dark:text-gray-400";
    const nameClass = isDark
        ? "text-gray-200 hover:text-white"
        : "text-brand-600 dark:text-brand-400";

    return (
        <p className={`${baseText} ${className}`}>
            Developed by{" "}
            <a
                href={EMAIL_HREF}
                title="Kirim email"
                className={`font-semibold ${nameClass} hover:underline`}
            >
                Muhammad Ichsan, S.Kom
            </a>
        </p>
    );
};

export default DeveloperCredit;
