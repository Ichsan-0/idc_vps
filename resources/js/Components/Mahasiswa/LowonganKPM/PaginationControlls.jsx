import ButtonNew from "@/Components/Button";

export default function PaginationControls({ currentPage, totalPages, onChange }) {
    const renderButtons = () => {
        const btns = [];
        let prevEllipsis = false;
        for (let i = 1; i <= totalPages; i++) {
            const isEdge = i === 1 || i === totalPages;
            const isNear = Math.abs(i - currentPage) <= 1;

            if (isEdge || isNear) {
                prevEllipsis = false;
                btns.push(
                    <button
                        key={i}
                        onClick={() => onChange(i)}
                        className={`px-4 py-2 rounded ${i === currentPage ? "bg-green-600 text-white" : "bg-white text-gray-700 border"}`}
                    >
                        {i}
                    </button>
                );
            } else if (!prevEllipsis) {
                btns.push(<span key={`e-${i}`}>...</span>);
                prevEllipsis = true;
            }
        }
        return btns;
    };

    return (
        <div className="flex justify-center items-center gap-x-4 mt-4">
            <ButtonNew variant="outline" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>
                Previous
            </ButtonNew>
            {renderButtons()}
            <ButtonNew variant="outline" disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>
                Next
            </ButtonNew>
        </div>
    );
}
