"use client"
import React, { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const VIDEO_SRC =
    "https://res.cloudinary.com/dtmnv5cdh/video/upload/v1751799624/Complete_payments_mazl71.mp4";

/**
 * The payment walkthrough. It is a portrait screen recording, so the caller owns the stage (a
 * phone-shaped box with a fixed aspect ratio) and the clip is letterboxed inside it — that keeps
 * the page from reflowing when the video metadata finally arrives.
 */
const Video_Mockup: React.FC<{ className?: string }> = ({ className }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const video = videoRef.current
        const section = sectionRef.current
        if (!video || !section) return

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Autoplay can be refused; the clip is decorative, so stay silent.
                    });
                    video.loop = true;
                }
            });
        };

        const observer = new window.IntersectionObserver(handleIntersection, {
            threshold: 0.5, // Play when 50% visible
        });

        observer.observe(section);

        return () => {
            observer.disconnect();
            video.pause();
        };
    }, []);

    const togglePlayback = () => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) video.play().catch(() => {
            // Autoplay can be refused; the clip is decorative, so stay silent.
        })
        else video.pause()
    }

    return (
        <div
            ref={sectionRef}
            role="button"
            tabIndex={0}
            aria-label="Play or pause the payment walkthrough"
            onClick={togglePlayback}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    togglePlayback()
                }
            }}
            className={cn("relative h-full w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-400", className)}
        >
            <video
                ref={videoRef}
                src={VIDEO_SRC}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
            />
        </div>
    );
};

export default Video_Mockup;
