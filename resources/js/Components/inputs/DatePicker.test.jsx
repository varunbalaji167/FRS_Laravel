import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
    it('renders the min/max attributes it is given', () => {
        render(
            <DatePicker
                id="dob"
                label="Date of birth"
                value=""
                onChange={vi.fn()}
                min="1950-01-01"
                max="2026-01-01"
            />,
        );

        const input = screen.getByLabelText('Date of birth');
        expect(input).toHaveAttribute('type', 'date');
        expect(input).toHaveAttribute('min', '1950-01-01');
        expect(input).toHaveAttribute('max', '2026-01-01');
    });

    it('reports aria-invalid and links the error message when `error` is set', () => {
        render(
            <DatePicker
                id="dob"
                label="Date of birth"
                value=""
                onChange={vi.fn()}
                error="Invalid date of birth."
            />,
        );

        const input = screen.getByLabelText('Date of birth');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Invalid date of birth.')).toHaveAttribute('id', 'dob-error');
    });

    it('forwards the raw value change to onChange (clamping is enforced by the min/max attrs + server)', () => {
        const onChange = vi.fn();
        render(<DatePicker id="dob" label="Date of birth" value="" onChange={onChange} min="1950-01-01" max="2026-01-01" />);

        const input = screen.getByLabelText('Date of birth');
        fireEvent.change(input, { target: { value: '1900-01-01' } });

        expect(onChange).toHaveBeenCalledWith('1900-01-01');
    });
});
