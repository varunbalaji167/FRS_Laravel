// TODO(Phase 5): reused on Admin/Hod/Applicant application lists.
export default function TableRowSkeleton() {
    return (
        <tr>
            <td colSpan={100}>
                <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            </td>
        </tr>
    );
}
