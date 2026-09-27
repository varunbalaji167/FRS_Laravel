<?php

namespace App\Http\Requests\Applicant\Rules;

// Unlike the other steps these keys sit outside `form_data.*`: documents and
// best_papers are top-level multipart fields (see Step11Documents.jsx).
class StepDocumentsRules
{
    /**
     * @return array<string, mixed>
     */
    public static function rules(int $currentYear): array
    {
        return [
            'form_data.declaration' => ['required', 'accepted'],

            'documents.phd_cert' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'documents.ssc_cert' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'documents.pg_cert' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.ug_cert' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.hsc_cert' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.payslip' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.noc' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.post_phd_exp' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.other_docs' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'documents.signature' => ['required', 'file', 'mimes:jpeg,png,jpg', 'max:2048'],

            'best_papers.best_paper_1' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'best_papers.best_paper_2' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'best_papers.best_paper_3' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'best_papers.best_paper_4' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'best_papers.best_paper_5' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
