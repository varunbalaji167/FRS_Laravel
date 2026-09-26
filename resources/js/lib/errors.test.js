import { describe, expect, it } from 'vitest';
import { flattenServerErrors, formatErrorCode } from './errors';

describe('flattenServerErrors', () => {
    it('flattens the Phase 3 DomainException contract (details.fields)', () => {
        const flat = flattenServerErrors({
            code: 'APP_STEP_INVALID',
            details: { fields: { 'form_data.personal_details.email': ['Invalid email format.'] } },
        });

        expect(flat).toEqual({ 'form_data.personal_details.email': 'Invalid email format.' });
    });

    it('flattens a plain Laravel ValidationException JSON body', () => {
        const flat = flattenServerErrors({
            message: 'The given data was invalid.',
            errors: { department: ['Department is required.'], grade: ['Grade is required.'] },
        });

        expect(flat).toEqual({
            department: 'Department is required.',
            grade: 'Grade is required.',
        });
    });

    it('passes through an already-flat Inertia errors bag', () => {
        const flat = flattenServerErrors({ first_name: 'First name is required.' });

        expect(flat).toEqual({ first_name: 'First name is required.' });
    });

    it('returns an empty object for null/undefined input', () => {
        expect(flattenServerErrors(null)).toEqual({});
        expect(flattenServerErrors(undefined)).toEqual({});
    });
});

describe('formatErrorCode', () => {
    it('returns the friendly message for a known code', () => {
        expect(formatErrorCode('APP_AD_DEADLINE_PASSED')).toBe(
            'The deadline for this advertisement has passed.',
        );
    });

    it('falls back for an unknown code', () => {
        expect(formatErrorCode('SOMETHING_NEW', 'fallback message')).toBe('fallback message');
    });
});
