import Button from "@/Components/Button";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import { config } from "@/config/config";
import axios from "axios";
import React from "react";
import { useState } from "react";

const ImportSupervisor = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("dataMahasiswa", data);
            const res = await axios.post(
                `${config.base_url}/api/superadmin/data/import/mahasiswa`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
        } catch (e) {
            setLoading(false);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex w-full py-2">
            <form className="flex flex-col gap-y-3" onSubmit={submit}>
                <input
                    className="flex w-full"
                    labelId="khs"
                    type="file"
                    onChange={(e) => setData(e.target.files[0])}
                />
                <div>
                    <Button
                        disabled={loading}
                        className="relative"
                        size="sm"
                        type="submit"
                    >
                        {loading ? <LoaderOnButton /> : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ImportSupervisor;
