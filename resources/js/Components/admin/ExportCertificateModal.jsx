import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Autocomplete, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

export default function ExportCertificateModal({
    children,
    show = false,
    maxWidth = "md",
    closeable = true,
    onClose = () => {},
    onConfirm = () => {},
    base_url,
    ...props
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };
    const [dataProdi, setDataProdi] = useState([]);
    const [slelectedProdi, setSelectedProdi] = useState(null);
    const confirm = () => {
        onConfirm(slelectedProdi);
    };

    const maxWidthClass = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
    }[maxWidth];

    const fetchData = async () => {
        try {
            const response = await axios.get("/api/prodi");
            setDataProdi(response.data.data);
            console.log(response);
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        console.log("modal");
        fetchData();
    }, []);

    const handleProdiChange = (e, value)=>{
        setSelectedProdi(value);

    }

   

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 flex overflow-y-auto px-4 py-6 sm:px-0 items-center z-50 transform transition-all"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-100"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:mx-auto ${maxWidthClass}`}
                        {...props}
                    >
                        <div className="p-3">
                            <ul className=" flex flex-col">
                                <li className="text-md font-bold">
                                    Export Nilai Mahasiswa
                                </li>
                                {/* <li className="text-sm mt-3">
                                    Data yang sudah dihapus tidak bisa
                                    dikembalikan
                                </li> */}
                                <li className="mt-5">
                                    <div className="flex flex-col">
                                        <Autocomplete
                                            id="prodi"
                                            value={slelectedProdi}
                                            required
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            options={dataProdi}
                                            onChange={(e, value) =>
                                                handleProdiChange(e, value)
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Prodi"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused": {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                        "& .MuiInputBase-input:focus": {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    }}
                                                />
                                            )}
                                            fullWidth
                                        />
                                        {/* {errors.province_code && (
                                            <InputError
                                                message={errors.province_code}
                                            />
                                        )} */}
                                    </div>
                                    {children}
                                </li>
                                <li className="text-sm mt-3 flex justify-end gap-x-4 w-full">
                                    <button
                                        className="flex ring-1 ring-blue-500 rounded-md p-2 text-blue-500 hover:bg-blue-500/10"
                                        onClick={(e) => confirm(e)}
                                    >
                                        yakin
                                    </button>
                                    <button
                                        className="flex ring-1 bg-blue-500 rounded-md p-2 text-white hover:bg-blue-500/90"
                                        onClick={close}
                                    >
                                        tidak
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
