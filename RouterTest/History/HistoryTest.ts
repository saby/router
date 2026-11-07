import type { IHistoryState } from 'Router/router';
/* eslint-disable-next-line */
import History from 'Router/_private/History';

/**
 * History лоя unit тестов c необходимыми публичными методами
 * @private
 */
export default class HistoryTest extends History {
    setHistory(newHistory: IHistoryState[]): void {
        this._setHistory(newHistory);
    }

    setHistoryPosition(position: number): void {
        this._setHistoryPosition(position);
    }

    /**
     * Выставить текущее состояние истории SPA переходов
     */
    setInititalSpaHistory(newHistorySPA: string[]): void {
        this._spaHistory = [...newHistorySPA];
    }

    getSpaHistory(): string[] {
        return this._spaHistory;
    }
}
