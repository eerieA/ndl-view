export class CryptoEntry {
    constructor(
        public readonly code: string,
        public readonly date: string,
        public readonly high: number,
        public readonly low: number,
        public readonly mid: number,
        public readonly last: number,
        public readonly bid: number,
        public readonly ask: number,
        public readonly volume: number,
        public readonly iconUrl: string
    ) {
        if (high < low) throw new Error(`Invalid range: high (${high}) should be >= low (${low})`);
        if (mid <= 0) throw new Error(`Invalid range: mid ${mid} is leq 0`);
    }

    static parseApiRow(row: any[], iconUrl: string): CryptoEntry {
        if (!Array.isArray(row) || row.length < 9) {
            throw new Error('Invalid API row format.');
        }

        const [code, date, high, low, mid, last, bid, ask, volume] = row;

        if (
            typeof code !== 'string' ||
            typeof date !== 'string' ||
            isNaN(Number(high)) ||
            isNaN(Number(low)) ||
            isNaN(Number(mid)) ||
            isNaN(Number(last)) ||
            isNaN(Number(bid)) ||
            isNaN(Number(ask)) ||
            isNaN(Number(volume))
        ) {
            throw new Error(`Invalid data types in row: ${JSON.stringify(row)}`);
        }

        return new CryptoEntry(
            code,
            date,
            Number(high),
            Number(low),
            Number(mid),
            Number(last),
            Number(bid),
            Number(ask),
            Number(volume),
            iconUrl
        );
    }

    get momentum(): number {
        return (this.last - this.low) / (this.high - this.low);
    }

    get spread(): number {
        return (this.ask - this.bid) / this.mid;
    }

    get isValid(): boolean {
        return this.high > this.low && this.mid > 0;
    }
}
