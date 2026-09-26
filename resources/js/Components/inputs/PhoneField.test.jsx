import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneField from './PhoneField';

// PhoneField is a controlled component, so the mask can only be observed by
// actually feeding each onChange back in as the next `value` — a bare mock
// only ever sees a single keystroke applied to the initial (empty) value.
function ControlledPhoneField(props) {
    const [value, setValue] = useState('');
    const [code, setCode] = useState('');
    return <PhoneField {...props} value={value} onChange={setValue} code={code} onCodeChange={setCode} />;
}

describe('PhoneField', () => {
    it('masks the national number to digits only, capped at 10', async () => {
        const user = userEvent.setup();
        render(<ControlledPhoneField id="phone" label="Phone" />);

        await user.type(screen.getByLabelText('Phone'), 'a9b8c7d6e5f4g3h2i1j0');

        expect(screen.getByLabelText('Phone')).toHaveValue('9876543210');
    });

    it('masks the country code to digits and a leading plus, capped at 5', async () => {
        const user = userEvent.setup();
        render(<ControlledPhoneField id="phone" label="Phone" />);

        await user.type(screen.getByLabelText('Phone country code'), '+9a1abc');

        expect(screen.getByLabelText('Phone country code')).toHaveValue('+91');
    });
});
