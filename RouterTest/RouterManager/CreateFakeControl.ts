import type { IRegisterableComponent } from 'Router/router';

export function createFakeControl(): IRegisterableComponent {
    const randomId = Math.random();
    return {
        getInstanceId: (): string => {
            return 'id-' + randomId;
        },
    };
}
