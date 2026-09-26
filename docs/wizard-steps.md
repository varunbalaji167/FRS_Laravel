# Wizard steps

The single canonical list of the 11 application wizard steps, matching the
actual code (`resources/js/Pages/Applicant/Steps/`). Both
[FRS_Maintenance.pdf](FRS_Maintenance.pdf) and
[FRS_Testing_Document.pdf](FRS_Testing_Document.pdf) describe earlier
revisions of this wizard and disagree with each other and with the code —
this file is the source of truth going forward; fix the PDFs' outlier
descriptions rather than adding a third version.

| # | Step component | Rules class | Mandatory today (`errorsForStep`) |
|---|---|---|---|
| 1 | `Step1Position.jsx` | `StepPositionRules` | department, grade |
| 2 | `Step2Personal.jsx` | `StepPersonalRules` | first/last name, dob, gender, category, nationality, email, phone |
| 3 | `Step3Education.jsx` | `StepEducationRules` | PhD university, department, date of joining |
| 4 | `Step4Employment.jsx` | `StepEmploymentRules` | present position, organization, date of joining, 3-years-experience flag |
| 5 | `Step5Research.jsx` | `StepResearchRules` | area of specialization, current area of research |
| 6 | `Step6AdditionalInfo.jsx` | `StepAdditionalInfoRules` | none today |
| 7 | `Step7AwardsProjects.jsx` | `StepAwardsProjectsRules` | none today |
| 8 | `Step8Statements.jsx` | `StepStatementsRules` | research plan, teaching plan |
| 9 | `Step9DetailedPubs.jsx` | `StepDetailedPubsRules` | none today |
| 10 | `Step10Referees.jsx` | `StepRefereesRules` | at least 3 referees, each with name/position/association/institute/email/contact |
| 11 | `Step11Documents.jsx` | `StepDocumentsRules` | PhD certificate, SSC certificate, signature, final declaration |

Steps 6, 7, and 9 have no server-side required-field checks yet — Phase 2
closes that gap per [docs/validation.md](validation.md).

## Adding a 12th step (or renaming one)

Per [docs/architecture.md](architecture.md) rule 6: add
`Step{N}{Name}.jsx` + `Steps/schemas/step{N}.js` + a
`Rules/Step{Name}Rules.php`, then update this table.
