import ApplicantLayout from "@/Layouts/ApplicantLayout";
import ApplicationDossier from "@/Components/applications/ApplicationDossier";

export default function ApplicationShow({ application }) {
    return (
        <ApplicationDossier
            application={application}
            Layout={ApplicantLayout}
            exportPdfUrl={route("applicant.applications.export.pdf", application.id)}
            exportExcelUrl={route("applicant.applications.export.excel", application.id)}
        />
    );
}
