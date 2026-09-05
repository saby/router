'use client';
import { useCallback, useState } from 'react';
import { registerClientReference } from 'UICore/rsc';

export default function Dynamic() {
    const [state, setState] = useState({ checked: false, message: '' });

    const onClick = useCallback(() => {
        const checked = !state.checked;
        let message = '';
        if (checked) {
            message = 'Чекбокс отмечен.';
        }
        setState({ checked, message });
    }, [state]);

    return (
        <div>
            <div>
                <input
                    type="checkbox"
                    name="dynamic"
                    id="dynamic"
                    checked={state.checked}
                    onChange={onClick}
                />
                <label htmlFor="dynamic">Меняем состояние по клику</label>
                <div style={{ paddingTop: '10px' }}>{state.message}</div>
            </div>
        </div>
    );
}

export const DynamicProxy = registerClientReference(
    Dynamic,
    'Router-demo/client/Dynamic.client',
    'default'
);
