import { RandomStringOptions } from './types/other.type';

export class Utils {
    private static symbols =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';

    static generateRandomString({
        onlyDigits,
        length,
    }: RandomStringOptions): string {
        let result = '';
        if (onlyDigits) {
            for (let index = 0; index < length; index++) {
                result += this.getNumber();
            }
        } else {
            for (let index = 0; index < length; index++) {
                const symbolPosition = this.getSymbolPosition();
                result += this.symbols.substring(
                    symbolPosition,
                    symbolPosition + 1,
                );
            }
        }
        return result;
    }

    private static getSymbolPosition(): number {
        while (true) {
            const symbolPosition = +(this.getNumber() + this.getNumber());
            if (symbolPosition <= this.symbols.length - 1) {
                return symbolPosition;
            }
        }
    }

    private static getNumber(): string {
        return Math.random().toString().substring(3, 4);
    }
}
