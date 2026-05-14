import { useEffect } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
// import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Alert,
    Checkbox,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Snackbar,
    TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import gambar from "../../../../public/assets/landmark-uinar-scaled.jpg";

import { useState } from "react";

export default function Register({ flash }) {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    useEffect(() => {
        if (flash.message !== null) {
            console.log("notify=> ", notify);
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        username: "",
        password: "",
        password_confirmation: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassowrd, setShowConfirmPassoword] = useState(false);

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"));
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () =>
        setShowConfirmPassoword((show) => !show);
    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full h-screen bg-white/90">
            <Head title="Register" />
            {flash.message && (
                <Snackbar
                    open={notify}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    autoHideDuration={3000}
                    onClose={handleCloseNotify}
                >
                    <Alert
                        onClose={handleCloseNotify}
                        severity={notifyStatus}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {flash.message && flash.message[notifyStatus]}
                    </Alert>
                </Snackbar>
            )}
            <div className="flex w-full justify-center items-center flex-col">
                <div className="flex w-full max-w-[500px] mb-3 items-start justify-start">
                    <img
                        className="w-28 cursor-pointer "
                        src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                    />
                </div>
                <form
                    onSubmit={submit}
                    className="min-w-[500px] bg-white shadow-md  rounded-md p-4 max-w-min"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-6">Register</h1>

                        <div className="mt-4">
                            <TextField
                                id="name"
                                type="text"
                                label="Nama"
                                value={data.name}
                                sx={{
                                    width: "100%",

                                    "& .MuiOutlinedInput-root.Mui-focused": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                    "& .MuiInputBase-input:focus": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                }}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />

                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>
                        <div className="mt-4">
                            <TextField
                                id="email"
                                type="text"
                                label="Email"
                                value={data.email}
                                sx={{
                                    width: "100%",

                                    "& .MuiOutlinedInput-root.Mui-focused": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                    "& .MuiInputBase-input:focus": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                }}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />

                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>
                        <div className="mt-4">
                            <TextField
                                id="username"
                                type="text"
                                label="NIM"
                                value={data.username}
                                sx={{
                                    width: "100%",

                                    "& .MuiOutlinedInput-root.Mui-focused": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                    "& .MuiInputBase-input:focus": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                }}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                            />

                            <InputError
                                message={errors.username}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <FormControl
                                sx={{ width: "100%" }}
                                variant="outlined"
                            >
                                <InputLabel htmlFor="outlined-adornment-password">
                                    Password
                                </InputLabel>
                                <OutlinedInput
                                    id="password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    value={data.password}
                                    type={showPassword ? "text" : "password"}
                                    sx={{
                                        width: "100%",

                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={
                                                    handleClickShowPassword
                                                }
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                />
                            </FormControl>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>
                        <div className="mt-4">
                            <FormControl
                                sx={{ width: "100%" }}
                                variant="outlined"
                            >
                                <InputLabel htmlFor="outlined-adornment-confirm-password">
                                    Confirm Password
                                </InputLabel>
                                <OutlinedInput
                                    id="confirm_password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    value={data.password_confirmation}
                                    type={
                                        showConfirmPassowrd
                                            ? "text"
                                            : "password"
                                    }
                                    sx={{
                                        width: "100%",

                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={
                                                    handleClickShowConfirmPassword
                                                }
                                                edge="end"
                                            >
                                                {showConfirmPassowrd ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                />
                            </FormControl>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-4">
                            <FormControlLabel
                                control={<Checkbox required name="gilad" />}
                                label="Dengan ini saya bersedia mengikuti Program hingga selesai jika diterima. Jika saya mengundurkan diri maka saya siap untuk tidak mengikuti PPKPM di semester selanjutnya"
                            />
                        </div>

                        <div className="flex items-center justify-end mt-4">
                            <Link
                                href={route("login")}
                                className=" text-sm text-yellow-600 hover:text-yellow-600/50 rounded-md  "
                            >
                                Sudah Punya Akun?
                            </Link>

                            <PrimaryButton
                                className="ms-4"
                                disabled={processing}
                            >
                                Register
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
            <img
                src={gambar}
                className="flex hidden md:block h-full w-full object-cover "
            />
        </div>
    );
}
