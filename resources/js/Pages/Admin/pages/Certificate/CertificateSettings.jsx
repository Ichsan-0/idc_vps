import SertifikatMahasiswaTable from '@/Components/AdminNew/Tables/Sertifikat/SertifikatMahasiswaTable';
import SertifikatSekolahTable from '@/Components/AdminNew/Tables/Sertifikat/SertifikatSekolahTable';
import PageBreadcrumb from '@/Components/PageBreadcrumb';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import React from 'react';

const CertificateSettings = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Page Header with Breadcrumb */}
        <div className="flex flex-col gap-3">
          <PageBreadcrumb 
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Pengaturan', href: '/admin/settings' },
              { label: 'Sertifikat', href: '#', active: true }
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sertifikat</h1>
          <p className="text-gray-600">Kelola template dan pengaturan sertifikat untuk sekolah dan mahasiswa</p>
        </div>

        {/* Sertifikat Sekolah Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Sertifikat Sekolah</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Kelola template sertifikat untuk kepala sekolah dan guru pamong
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {typeof window !== 'undefined' ? 
                    (localStorage.getItem('sertifikat_sekolah_count') || '0') : '0'} 
                  Template
                </span>
              </div>
            </div>
          </div>
          <div className="p-1">
            <SertifikatSekolahTable />
          </div>
        </div>

        {/* Sertifikat Mahasiswa Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Sertifikat Mahasiswa</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Kelola template sertifikat untuk mahasiswa PPL/KPM
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {typeof window !== 'undefined' ? 
                    (localStorage.getItem('sertifikat_mahasiswa_count') || '0') : '0'} 
                  Template
                </span>
              </div>
            </div>
          </div>
          <div className="p-1">
            <SertifikatMahasiswaTable />
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Informasi Penting</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Template sertifikat aktif akan digunakan untuk pencetakan</li>
                <li>• Hanya satu template yang dapat aktif per periode</li>
                <li>• Pastikan format nomor sertifikat sesuai dengan standar</li>
                <li>• Template dapat dihubungkan dengan gelombang tertentu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CertificateSettings;