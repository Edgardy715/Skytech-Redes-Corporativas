import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

export default function AnimatedNumber({ value, suffix = "", prefix = "", className = "" }: { value: number, suffix?: string, prefix?: string, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Intl.NumberFormat("en-US").format(Math.round(latest)) + suffix;
      }
    });
  }, [springValue, prefix, suffix]);

  return <span ref={ref} className={className} />;
}
