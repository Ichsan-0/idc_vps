import { Link } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import React from "react";

const StudentSidebar = ({ students, selectedStudent, onStudentSelect, data }) => {
    return (
        <div className="w-80 bg-white border-r border-gray-200 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="p-6">
                <div className="space-y-3">
                    <div className="flex py-4 my-5 flex-row">
                        <Link href={`/supervisor-kpm/classroom/${data?.id_kelas}/task/${data?.id_tugas}/detail`} className="flex flex-row text-gray-600 hover:text-gray-800 gap-1 items-center justify-center py-1 px-2">
                            <ChevronLeft />
                            Petunjuk Tugas
                        </Link>
                    </div>
                    {students.map((student) => (
                        <div
                            key={student.id}
                            onClick={() => onStudentSelect?.(student)}
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                                selectedStudent?.id === student.id
                                    ? "bg-blue-50 border border-blue-200"
                                    : "hover:bg-gray-50"
                            }`}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-200 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {getInitials(student?.mahasiswa?.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {student?.mahasiswa?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {student?.mahasiswa?.username}
                                </p>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                                {student.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentSidebar;

function getInitials(name) {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }
    const first = words[0][0].toUpperCase();
    const last = words[words.length - 1][0].toUpperCase();
    return first + last;
}
