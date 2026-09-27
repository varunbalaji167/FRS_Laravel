import TextareaField from "@/Components/inputs/TextareaField";

export default function Step8Statements({ data, setData, localErrors = {} }) {
    // Grouping these under a new 'statements' object in our JSON
    const statements = data.form_data.statements || {};

    const updateStatement = (field, value) => {
        setData("form_data", {
            ...data.form_data,
            statements: { ...statements, [field]: value },
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                {/* Main Header continuously numbered */}
                <h3 className="text-2xl font-bold text-slate-900">7. Contributions & Future Plans</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Provide detailed statements regarding your research, teaching, and professional service.
                </p>
            </div>

            {/* (A) Research Contribution & Plans */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">
                    Outline your core research interests, methodologies, past achievements, and specific goals for your
                    tenure at IIT Indore.
                </p>
                <TextareaField
                    id="research_plan"
                    label="(A) Significant research contribution and future plans"
                    required
                    rows={12}
                    value={statements.research_plan}
                    onChange={(v) => updateStatement("research_plan", v)}
                    placeholder="My primary research interests focus on understanding the dynamics of..."
                    error={localErrors["statements.research_plan"]}
                />
            </div>

            {/* (B) Teaching Contribution & Plans */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500">
                    Detail your teaching philosophy, proposed UG/PG courses, and pedagogical approach.
                </p>
                <TextareaField
                    id="teaching_plan"
                    label="(B) Significant teaching contribution and future plans"
                    required
                    rows={12}
                    value={statements.teaching_plan}
                    onChange={(v) => updateStatement("teaching_plan", v)}
                    placeholder="With my academic background in..."
                    error={localErrors["statements.teaching_plan"]}
                />
            </div>

            {/* (C) Professional Service */}
            <div className="space-y-4">
                <p className="text-xs text-slate-500">
                    List journals you review for, editorial board memberships, or conference committees.
                </p>
                <TextareaField
                    id="professional_service"
                    label="(C) Professional Service as Reviewer/Editor etc."
                    rows={6}
                    value={statements.professional_service}
                    onChange={(v) => updateStatement("professional_service", v)}
                    placeholder={"1. Reviewer for Advances in Space Research (Elsevier)\n2. ..."}
                />
            </div>

            {/* (D) Any other relevant information */}
            <div className="space-y-4">
                <TextareaField
                    id="other_info"
                    label="(D) Any other relevant information"
                    rows={6}
                    value={statements.other_info}
                    onChange={(v) => updateStatement("other_info", v)}
                />
            </div>
        </div>
    );
}
