import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string | ((t: number) => number);
    splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    threshold?: number;
    rootMargin?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    textAlign?: React.CSSProperties['textAlign'];
    onLetterAnimationComplete?: () => void;
    highlight?: string | string[];
    highlightClass?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 1.25,
    ease = 'power3.out',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-100px',
    tag = 'p',
    textAlign = 'center',
    onLetterAnimationComplete,
    highlight = '',
    highlightClass = 'text-brand'
}) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const animationCompletedRef = useRef(false);
    const onCompleteRef = useRef(onLetterAnimationComplete);
    const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onLetterAnimationComplete;
    }, [onLetterAnimationComplete]);

    useEffect(() => {
        if (document.fonts.status === 'loaded') {
            setFontsLoaded(true);
        } else {
            document.fonts.ready.then(() => {
                setFontsLoaded(true);
            });
        }
    }, []);

    useGSAP(
        () => {
            if (!ref.current || !text || !fontsLoaded) return;
            // Prevent re-animation if already completed
            if (animationCompletedRef.current) return;
            const el = ref.current as HTMLElement & {
                _rbsplitInstance?: GSAPSplitText;
            };

            if (el._rbsplitInstance) {
                try {
                    el._rbsplitInstance.revert();
                } catch (_) { }
                el._rbsplitInstance = undefined;
            }

            const startPct = (1 - threshold) * 100;
            const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
            const marginValue = marginMatch?.[1] ? parseFloat(marginMatch[1]) : 0;
            const marginUnit = marginMatch?.[2] || 'px';
            const sign =
                marginValue === 0
                    ? ''
                    : marginValue < 0
                        ? `-=${Math.abs(marginValue)}${marginUnit}`
                        : `+=${marginValue}${marginUnit}`;
            const start = `top ${startPct}%${sign}`;
            let targets: Element[] = [];
            const assignTargets = (self: GSAPSplitText) => {
                if (splitType.includes('chars') && (self as GSAPSplitText).chars?.length)
                    targets = (self as GSAPSplitText).chars;
                if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
                if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
                if (!targets.length) targets = self.chars || self.words || self.lines;
            };
            const splitInstance = new GSAPSplitText(el, {
                type: splitType,
                smartWrap: true,
                autoSplit: splitType === 'lines',
                linesClass: 'split-line',
                wordsClass: 'split-word',
                charsClass: 'split-char',
                reduceWhiteSpace: false,
                onSplit: (self: GSAPSplitText) => {
                    assignTargets(self);

                    // Apply highlighting if provided
                    if (highlight) {
                        const highlights = Array.isArray(highlight) ? highlight : [highlight];
                        const highlightsLower = highlights.map(h => h.toLowerCase());
                        
                        // Handle words if they exist (best for highlighting)
                        if (self.words && self.words.length > 0) {
                            self.words.forEach(word => {
                                const wordText = word.textContent?.toLowerCase().trim() || '';
                                if (wordText && highlightsLower.some(h => h.includes(wordText))) {
                                    word.classList.add(...highlightClass.split(' '));
                                }
                            });
                        } else if (self.chars && self.chars.length > 0) {
                            // Fallback for character-only split (less precise)
                            // We only highlight if the entire text matches a highlight
                            // to avoid highlighting individual letters everywhere.
                            const fullText = el.textContent?.toLowerCase().trim() || '';
                            if (highlightsLower.some(h => h.includes(fullText))) {
                                self.chars.forEach(char => char.classList.add(...highlightClass.split(' ')));
                            }
                        }
                    }

                    return gsap.fromTo(
                        targets,
                        { ...from },
                        {
                            ...to,
                            duration,
                            ease,
                            stagger: delay / 1000,
                            scrollTrigger: {
                                trigger: el,
                                start,
                                once: true,
                                fastScrollEnd: true,
                                anticipatePin: 0.4
                            },
                            onComplete: () => {
                                animationCompletedRef.current = true;
                                onCompleteRef.current?.();
                            },
                            willChange: 'transform, opacity',
                            force3D: true
                        }
                    );
                }
            });
            el._rbsplitInstance = splitInstance;
            return () => {
                ScrollTrigger.getAll().forEach(st => {
                    if (st.trigger === el) st.kill();
                });
                try {
                    splitInstance.revert();
                } catch (_) { }
                el._rbsplitInstance = undefined;
            };
        },
        {
            dependencies: [
                text,
                delay,
                duration,
                ease,
                splitType,
                JSON.stringify(from),
                JSON.stringify(to),
                threshold,
                rootMargin,
                fontsLoaded,
                highlight,
                highlightClass
            ],
            scope: ref
        }
    );

    const renderTag = () => {
        const style: React.CSSProperties = {
            textAlign,
            wordWrap: 'break-word',
            willChange: 'transform, opacity'
        };
        const isHeading = tag && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag);
        const displayClass = isHeading ? 'block' : 'inline-block';
        const classes = `split-parent overflow-hidden ${displayClass} whitespace-normal ${className}`;
        const Tag = (tag || 'p') as React.ElementType;

        return (
            <Tag ref={ref} style={style} className={classes}>
                {text}
            </Tag>
        );
    };

    return renderTag();
};

export { SplitText };
export default SplitText;
