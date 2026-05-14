import { Alert, Snackbar } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const Notify = ({ flash }) => {
    const [notify, setNotify] = useState(
        flash?.message !== null ? true : false
    );
    const [notifyStatus, setNotifyStatus] = useState("default");

    useEffect(() => {
        if (flash.message) {
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
    }, [flash.message]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };
    return (
        <Snackbar
            open={notify}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            autoHideDuration={2000}
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
    );
};

export default Notify;
