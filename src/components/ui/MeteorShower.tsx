"use client";

import { useEffect, useRef } from "react";

interface MeteorShowerProps {
  className?: string;
  count?: number;
}

export function MeteorShower({ className = "", count = 6 }: MeteorShowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let meteors: Meteor[] = [];

    // Meteor Class
    // eslint-disable-next-line react-hooks/unsupported-syntax
    class Meteor {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      width: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.speed = 0;
        this.opacity = 0;
        this.width = canvasWidth;
        this.reset(canvasWidth, canvasHeight, true);
      }

      reset(canvasWidth: number, canvasHeight: number, initial = false) {
        this.width = canvasWidth;
        // Randomize starting position
        // Start mostly from the top-right area
        // We want them to flow from top-right to bottom-left

        if (initial) {
          this.x = Math.random() * canvasWidth;
          this.y = Math.random() * canvasHeight;
        } else {
          // Spawn along the top edge or right edge
          if (Math.random() > 0.5) {
            // Top edge (biased towards right)
            this.x = Math.random() * canvasWidth + canvasWidth * 0.2;
            this.y = -100;
          } else {
            // Right edge (biased towards top)
            this.x = canvasWidth + 100;
            this.y = Math.random() * canvasHeight - canvasHeight * 0.2;
          }
        }

        // Physics properties
        this.speed = Math.random() * 2 + 0.5; // Slow, lazy movement
        this.length = Math.random() * 300 + 150; // Longer trails
        this.opacity = Math.random() * 0.15 + 0.05; // Very subtle opacity
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x -= this.speed;
        this.y += this.speed;

        // Reset if out of bounds (bottom or left)
        // Add buffer for trail length
        if (this.y > canvasHeight + 100 || this.x < -this.length - 100) {
          this.reset(canvasWidth, canvasHeight);
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Calculate tail end position (opposite to movement)
        // Moving (-1, +1), so tail is (+1, -1)
        const tailX = this.x + this.length;
        const tailY = this.y - this.length;

        // Create gradient for the trail
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`); // Head
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Tail end

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Optional: Glowing head
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        // ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        // ctx.fill();
      }
    }

    // Initialize
    const init = () => {
      resizeCanvas();
      meteors = Array.from(
        { length: count },
        () => new Meteor(canvas.width, canvas.height)
      );
    };

    // Resize handler
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((meteor) => {
        meteor.update(canvas.width, canvas.height);
        meteor.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
