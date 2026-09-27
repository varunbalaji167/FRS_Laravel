import AdminLayout from "@/Layouts/AdminLayout";
import ApplicationDossier from "@/Components/applications/ApplicationDossier";

export default function ApplicationShow({ application }) {
    return (
        <ApplicationDossier
            application={application}
            Layout={AdminLayout}
            exportPdfUrl={route("admin.applications.export.pdf", application.id)}
            exportExcelUrl={route("admin.applications.export.excel", application.id)}
            reviewPath={route("admin.applications.update", application.id)}
        />
    );
}
