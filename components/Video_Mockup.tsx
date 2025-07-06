"use client"
import React, { useRef, useEffect } from "react";

const VIDEO_SRC =
    "https://res.cloudinary.com/dtmnv5cdh/video/upload/v1751799624/Complete_payments_mazl71.mp4";

const Video_Mockup: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && videoRef.current) {
                    videoRef.current.play();
                    videoRef.current.loop = true;
                }
            });
        };

        const observer = new window.IntersectionObserver(handleIntersection, {
            threshold: 0.5, // Play when 50% visible
        });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            observer.disconnect();
            videoRef.current?.pause()
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            tabIndex={0}
            style={{ cursor: "pointer", width: "70%", maxWidth: 600, margin: "auto" }}
        >
            <video
                ref={videoRef}
                src={VIDEO_SRC}
                muted
                preload="none"
                style={{ width: "100%" }}
            />
        </section>
    );
};

export default Video_Mockup;