import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number = 3) {
    const [count, setCount] = useState<number | null>(null);
    const [isCountingDown, setIsCountingDown] = useState(false);

    const startCountdown = useCallback(() => {
        return new Promise<void>((resolve) => {
            setIsCountingDown(true);
            setCount(initialSeconds);

            let current = initialSeconds;
            const interval = setInterval(() => {
                current--;
                if (current > 0) {
                    setCount(current);
                } else {
                    setCount(null);
                    setIsCountingDown(false);
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    }, [initialSeconds]);

    return {
        count,
        isCountingDown,
        startCountdown,
    };
}
