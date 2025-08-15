import React, {useId} from 'react';

export interface ProportionalStarProps {
    /** Percentage 0-100 or fraction 0-1 */
    percent: number;
    /** CSS className for sizing / layout */
    className?: string;
    /** Fill / stroke color */
    color?: string;
    /** Direction of fill */
    direction?: 'vertical' | 'horizontal';
    /** If true, keep outline even when empty */
    showEmptyOutline?: boolean;
}

// Renders star with proportional fill either vertical (bottom->top) or horizontal (left->right)
export const ProportionalStar: React.FC<ProportionalStarProps> = ({
                                                                      percent,
                                                                      className = '',
                                                                      color = '#ff8d1e',
                                                                      direction = 'vertical',
                                                                      showEmptyOutline = true,
                                                                  }) => {
    const id = useId();
    let pct = percent;
    if (pct <= 1) pct = pct * 100; // accept fraction
    pct = Math.max(0, Math.min(100, pct));
    const gradientId = `starGradient-${id}`;
    const pathD = "M38.91,36.22a1.26,1.26,0,0,0,1.43-1c1.23-3.94,9.34-29.69,9.34-29.69A2.42,2.42,0,0,1,50.52,4a1.82,1.82,0,0,1,2.78,1.1l9.49,30.15a1.13,1.13,0,0,0,1.3,1l31.33,0a2.1,2.1,0,0,1,1.94.85,1.65,1.65,0,0,1-.56,2.45L71.39,57.32a1.61,1.61,0,0,0-.73,2.22L80.32,88.3c.34,1,.81,2.08-.32,2.91s-2,.08-2.86-.57L53.51,73.16c-2-1.45-1.94-1.46-3.85,0L25.81,90.79a5.6,5.6,0,0,1-1.07.66A1.59,1.59,0,0,1,23,91.12a1.54,1.54,0,0,1-.56-1.73L32.56,59c.18-.53.25-.92-.32-1.32L6.68,39.78C5.61,39,5.25,38.3,5.52,37.46s.92-1.26,2.25-1.26Z";

    // Edge cases for crisp rendering
    if (pct <= 0) {
        return (
            <svg viewBox="0 0 96.26 91.88" className={className} role="img" aria-label="0%">
                <title>0%</title>
                <path
                    d={pathD}
                    transform="translate(-3.43 -1.7)"
                    fill={showEmptyOutline ? 'none' : 'transparent'}
                    stroke={color}
                    strokeWidth={4}
                    strokeMiterlimit={10}
                    fillRule="evenodd"
                />
            </svg>
        );
    }
    if (pct >= FULL_FILL_THRESHOLD) {
        return (
            <svg viewBox="0 0 96.26 91.88" className={className} role="img" aria-label="100%">
                <title>100%</title>
                <path
                    d={pathD}
                    transform="translate(-3.43 -1.7)"
                    fill={color}
                    stroke={color}
                    strokeWidth={4}
                    strokeMiterlimit={10}
                    fillRule="evenodd"
                />
            </svg>
        );
    }

    const gradientProps = direction === 'horizontal'
        ? {x1: '0%', y1: '0%', x2: '100%', y2: '0%'}
        : {x1: '0%', y1: '100%', x2: '0%', y2: '0%'}; // vertical bottom->top

    return (
        <svg viewBox="0 0 96.26 91.88" className={className} role="img" aria-label={`${pct.toFixed(0)}%`}>
            <defs>
                <linearGradient id={gradientId} {...gradientProps}>
                    {direction === 'horizontal' ? (
                        <>
                            <stop offset="0%" stopColor={color}/>
                            <stop offset={`${pct}%`} stopColor={color}/>
                            <stop offset={`${pct}%`} stopColor="transparent"/>
                            <stop offset="100%" stopColor="transparent"/>
                        </>
                    ) : (
                        <>
                            <stop offset="0%" stopColor={color}/>
                            <stop offset={`${pct}%`} stopColor={color}/>
                            <stop offset={`${pct}%`} stopColor="transparent"/>
                            <stop offset="100%" stopColor="transparent"/>
                        </>
                    )}
                </linearGradient>
            </defs>
            <title>{pct.toFixed(0)}%</title>
            <path
                d={pathD}
                transform="translate(-3.43 -1.7)"
                fill={`url(#${gradientId})`}
                stroke={color}
                strokeWidth={4}
                strokeMiterlimit={10}
                fillRule="evenodd"
            />
        </svg>
    );
};


