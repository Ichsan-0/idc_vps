import { router } from "@inertiajs/react";
import { Button } from "@mui/material";
import React from "react";

const LownganKPMCard = ({kpm, index, locationDetails}) => {
    return (
        <div
            key={`${kpm.id}-${index}`}
            className="flex w-full bg-white ring-1 ring-gray-200 rounded-md py-5 px-3 "
        >
            <div className="flex w-full justify-between items-end">
                <div className="flex w-full flex-col">
                    <p className="font-bold">{kpm?.name}</p>
                    <p>{locationDetails}</p>
                    <div className="flex flex-row gap-x-2 w-full">
                        <p className="flex px-2 py-1 w-fit  rounded-md bg-tertiary/30 text-tertiary ">
                            Kuota{" "}
                            <span className="font-bold  ml-2">
                                {kpm?.qouta}
                            </span>
                        </p>
                        <p className="flex px-2 py-1 w-fit  rounded-md bg-yellow-600/30 text-yellow-800 ">
                            Terisi{" "}
                            <span className="font-bold  ml-2">
                                {kpm?.terisi}
                            </span>
                        </p>
                    </div>
                </div>
                <div>
                    <Button
                        size="small"
                        disableElevation
                        variant="contained"
                        onClick={(e) => {
                            e.preventDefault();

                            router.visit(`/kpm-vacancies/detail/${kpm.id}`);
                        }}
                        sx={{
                            color: "white",
                            textTransform: "capitalize",
                        }}
                    >
                        Lihat
                    </Button>
                </div>
            </div>
            <div></div>
        </div>
    );
};

export default LownganKPMCard;
