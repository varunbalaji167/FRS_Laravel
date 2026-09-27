import HodLayout from "@/Layouts/HodLayout";
import ApplicationDossier from "@/Components/applications/ApplicationDossier";

export default function ApplicationShow({ application }) {
    return (
        <ApplicationDossier
            application={application}
            Layout={HodLayout}
            exportPdfUrl={route("hod.applications.export.pdf", application.id)}
            exportExcelUrl={route("hod.applications.export.excel", application.id)}
            reviewPath={route("hod.applications.update", application.id)}
        />
    );
}
