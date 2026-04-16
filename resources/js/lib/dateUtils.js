/**
 * Calculates the exact age in Years, Months, and Days from a Date of Birth.
 * * @param {string|Date} dobString - The date of birth (e.g., '1990-05-15')
 * @returns {string|null} - Formatted age string (e.g., '34Y 10M 2D') or null if invalid
 */
export function calculateAge(dobString) {
    if (!dobString) return null;

    const dob = new Date(dobString);
    const now = new Date();

    if (isNaN(dob.getTime())) return null;

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    let parts = [];
    if (years > 0) parts.push(`${years}Y`);
    if (months > 0) parts.push(`${months}M`);
    if (days > 0) parts.push(`${days}D`);

    return parts.length > 0 ? parts.join(" ") : "0D";
}

export function calculateDuration(startStr, endStr) {
    if (!startStr) return "";

    const start = new Date(startStr);
    let end;

    // Treat empty end date or "Continuing" as today
    if (!endStr || endStr === "Continuing") {
        end = new Date();
    } else {
        end = new Date(endStr);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return "";
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Format to YY-MM-DD with leading zeros
    const yy = String(years).padStart(2, "0");
    const mm = String(months).padStart(2, "0");
    const dd = String(days).padStart(2, "0");

    return `${yy}-${mm}-${dd}`;
}
