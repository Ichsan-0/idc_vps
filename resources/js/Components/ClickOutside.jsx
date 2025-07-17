import React, { useEffect, useRef } from "react";

const ClickOutside = ({ children, exceptionRef, onClick, className }) => {
    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClicklistener = (event) => {
            let clickedInside = false;
            if (exceptionRef) {
                clickedInside =
                    (wrapperRef.current &&
                        wrapperRef.current.contains(event.target)) ||
                    (exceptionRef.current &&
                        exceptionRef.current === event.target) ||
                    (exceptionRef.current &&
                        exceptionRef.current.contains(event.target));
            } else {
                clickedInside =
                    wrapperRef.current &&
                    wrapperRef.current.contains(event.target);
            }
            if (!clickedInside) {
                onClick();
            }
        };
        document.addEventListener("mousedown", handleClicklistener);

        return () => {
            document.removeEventListener("mousedown", handleClicklistener);
        };
    }, [exceptionRef, onClick]);
    return (
        <div ref={wrapperRef} className={`${className || ""}`}>
            {children}
        </div>
    );
};

export default ClickOutside;
