import React, { useState } from "react";
import { User, ChevronRight, MessageSquare } from "lucide-react";
import { Avatar } from "@mui/material";
import notFound from "../../../../../../public/images/nodata-found 1.png";
import axios from "axios";
import { config } from "@/config/config";

const RightSidebar = ({
    selectedStudent,
    activeNav,
    onNavChange,
    privateCommentData,
    onPostComment,
    getStudentSubmission,
    data
}) => {
    const [nilai, setNilai] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [responseError, setResponseError] = useState(null);

    const updateNilai = async (e) => {
        console.log('nilai', nilai);
        if (nilai !== null || nilai !== "") {
            try {
                setLoading(true);
                const formData = new FormData();
                formData.append("id_kelas", data?.id_kelas);
                formData.append("id_tugas", data?.id_tugas);
                formData.append("status", "dinilai");
                formData.append(
                    "username_mahasiswa",
                    selectedStudent?.username_mahasiswa
                );
                formData.append("score", nilai);

                const response = await axios.post(
                    `${config.base_url}/api/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update`,
                    formData
                );
                if (response.data?.success === true) {
                    setNilai("");
                    getStudentSubmission();
                }
            } catch (err) {
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="p-6">
                {selectedStudent && (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">
                                    {selectedStudent.name}
                                </h3>
                                <span className="text-sm font-semibold text-gray-900">
                                    {selectedStudent.score}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                {selectedStudent.studentId}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                {selectedStudent.status}
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nilai
                                </label>
                                <input
                                    type="text"
                                    value={nilai}
                                    onChange={(e) => setNilai(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter grade..."
                                />
                                <button
                                    onClick={updateNilai}
                                    disabled={!nilai || loading}
                                    className="w-full mt-2 px-4 py-2 disabled:bg-gray-200 bg-blue-500 hover:text-gray-500 text-white disabled:text-gray-500 rounded-md transition-colors"
                                >
                                    Simpan Nilai
                                </button>
                            </div>
                        </div>
                        {/* Comments Section */}
                        <div className="flex flex-col gap-y-2 border-t border-gray-200 pt-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                    Private Comments
                                </span>
                            </div>

                            <ul className="w-full h-full flex flex-col gap-2">
                                {privateCommentData.length > 0 ? (
                                    privateCommentData.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex flex-row text-textblack gap-2"
                                        >
                                            <Avatar />
                                            <div>
                                                <h3 className="text-md">
                                                    {item.sender_name}
                                                </h3>
                                                <p className="text-sm text-wrap">
                                                    {item.message}
                                                </p>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <div className="flex w-full h-full justify-center">
                                        <img
                                            src={notFound}
                                            className="h-40"
                                        ></img>
                                    </div>
                                )}
                            </ul>

                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add Comment"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <button
                                    onClick={(e) => onPostComment(e, comment)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RightSidebar;
