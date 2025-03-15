declare module 'pino-roll' {
    import type { SonicBoom } from 'sonic-boom';

    interface RollOptions {
        file: string;
        frequency?: string;
        maxFiles?: number;
        compress?: boolean;
        mkdir?: boolean;
        dateFormat?: string;
    }

    export default function pinoRoll(options: RollOptions): Promise<SonicBoom>;
}
