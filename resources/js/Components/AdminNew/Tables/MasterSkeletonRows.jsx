const MasterSkeletonRows = () => {
    const skeletonRows = Array.from({ length: entriesPerPage }, (_, idx) => (
        <tr key={`skeleton-${idx}`}>
            {Array.from({ length: 5 }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 w-full bg-skeleton animate-pulse rounded"></div>
                </td>
            ))}
        </tr>
    ));
    return MasterSkeletonRows;
};