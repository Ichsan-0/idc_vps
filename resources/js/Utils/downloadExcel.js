import axios from "axios";

/**
 * Utility untuk download file Excel dari endpoint Laravel yang dilindungi auth:sanctum.
 *
 * @param {object} options
 * @param {string}  options.url         - Full URL endpoint POST untuk export
 * @param {object}  [options.data]      - Body payload yang dikirim ke server
 * @param {string}  [options.filename]  - Nama file default jika Content-Disposition tidak ada
 */
export async function downloadExcel({ url, data = {}, filename = "export.xlsx" }) {
    // Ambil CSRF token dari cookie yang di-set Laravel (Sanctum SPA)
    const rawCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
    const csrfToken = rawCookie ? decodeURIComponent(rawCookie) : undefined;

    const response = await axios.post(url, data, {
        responseType: "blob",
        withCredentials: true,
        headers: {
            Accept: "application/json",
            ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        },
    });

    // Cek apakah response bukan file Excel (kemungkinan error HTML/JSON)
    const contentType = response.headers["content-type"] || "";
    if (
        !contentType.includes("spreadsheetml") &&
        !contentType.includes("octet-stream") &&
        !contentType.includes("zip")
    ) {
        // Decode konten untuk mendapatkan pesan error
        const text = new TextDecoder().decode(await response.data.arrayBuffer());
        let msg = "Server mengembalikan response yang bukan file Excel.";
        try {
            const parsed = JSON.parse(text);
            msg = parsed.message || parsed.error || msg;
        } catch (_) {
            if (text.includes("<html>")) msg = "Server Error. Periksa log aplikasi.";
        }
        throw new Error(msg);
    }

    const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = downloadUrl;

    // Coba ambil nama file dari Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "").trim();
        }
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
    }, 200);
}
