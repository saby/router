import { useContext } from 'react';
import { logger } from 'Application/Env';
import Context from './Context';
import { IRouter } from '../Router/Router';
import { getWasabyContext } from 'UICore/Contexts';

/**
 * Хук для получения Router из контекста.
 * @public
 */
export function useRouter(): IRouter {
    const router = useContext(Context);
    const { Router } = useContext(getWasabyContext());

    if (!router) {
        logger.warn(new Error('Router не нашелся в контексте'));
    }

    return router || Router;
}
