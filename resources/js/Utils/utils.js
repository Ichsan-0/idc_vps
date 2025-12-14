export const getMappingStatus = (status) => {
    if (status === "submitted") return "Submitted";
    if (status === "accepted") return "Diterima";
    if (status === "rejected") return "Ditolak";
    if (status === "revisi") return "Revisi";
    return "Belum melengkai Biodata";
};

export const getStatusColor = (status) => {
    if (status === "submitted") return "warning";
    if (status === "accepted") return "success";
    if (status === "rejected") return "error";
    if (status === "revisi") return "warning";
    return "info";
};

const getStatusColorInDetail = (status) =>{
    if (status === "submitted") return "warning";
    if (status === "accepted") return "success";
    if (status === "rejected") return "error";
    if (status === "revisi") return "warning";
    return "info";
}
