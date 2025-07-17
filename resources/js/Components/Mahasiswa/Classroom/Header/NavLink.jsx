import { Link, usePage } from "@inertiajs/react";

export default function NavLink({
    active = false,
    className = "",
    children,
    ...props
}) {
    const { url } = usePage(); // Get the current URL

    const isActive = props.href === url; // Check if the current link matches the URL

    return (
        <Link
            {...props}
            className={`${className} ${
                isActive || active ? "text-white" : "text-bodydark2"
            }`}
        >
            {children}
        </Link>
    );
}
