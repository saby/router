import { logger, query } from 'Application/Env';

export function logRouter(tag: string, message: string | undefined) {
    if (!query.get.logRouter) {
        return;
    }

    logger.info(`Router|${tag} `, message);
}
