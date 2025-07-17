import React from "react";
import Modal from "./Modal";

const ModalDelete = ({ show, onClose = () => {} }) => {
    return (
        <Modal show={show}>
            <div className="p-3">
                <ul className=" flex flex-col">
                    <li className="text-md font-bold">Yakin ingin menghapus</li>
                    <li className="text-sm mt-3">
                        Data yang sudah dihapus tidak bisa dikembalikan
                    </li>
                    <li className="text-sm mt-3 flex justify-end gap-x-4 w-full">
                        <button className="flex ring-1 ring-blue-500 rounded-md p-2 text-blue-500 hover:bg-blue-500/10">
                            yakin
                        </button>
                        <button
                            className="flex ring-1 bg-blue-500 rounded-md p-2 text-white hover:bg-blue-500/90"
                            onClick={onDialogClose}
                        >
                            tidak
                        </button>
                    </li>
                </ul>
            </div>
        </Modal>
    );
};

export default ModalDelete;
