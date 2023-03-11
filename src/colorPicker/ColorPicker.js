import { useEffect, useRef, useState } from "react";

import "./ColorPicker.css";

export function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export function hexToHsl(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
  
    // Find the minimum and maximum values of RGB
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
  
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      // Achromatic case
      h = s = 0;
    } else {
      // Chromatic case
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;

        default:
            break;
      }
  
      h /= 6;
    }
  
    const toPercent = (n) => (n * 100).toFixed(0);
  
    return {
        hue: Math.round(h * 360), 
        saturation: toPercent(s),
        lightness: toPercent(l)
    };
  }

function usePicker(ref, defaultValue, min, max) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        ref.current.addEventListener("mousedown", (event) => {
            const mousemove = (event) => {
                const canvas = ref.current;
                const parent = canvas.parentElement;
                const bounds = parent.getBoundingClientRect();

                setValue(Math.min(Math.max(Math.round(min + ((event.pageX - bounds.left) / bounds.width * max)), min), max));
            };

            mousemove(event);

            window.addEventListener("mousemove", mousemove);

            const mouseup = () => {
                window.removeEventListener("mousemove", mousemove);
                window.removeEventListener("mouseup", mouseup);
            };

            window.addEventListener("mouseup", mouseup);
        });
    }, [ref]);

    return [value, setValue];
};

export default function ColorPicker({ color, onChange }) {
    const hueRef = useRef();
    const saturationRef = useRef();
    const lightnessRef = useRef();

    const initialColor = hexToHsl(color);

    const [hue, setHue] = usePicker(hueRef, initialColor.hue, 0, 360);
    useEffect(() => onChange(hslToHex(hue, saturation, lightness)), [hue]);

    const [saturation, setSaturation] = usePicker(saturationRef, initialColor.saturation, 0, 100);
    useEffect(() => onChange(hslToHex(hue, saturation, lightness)), [saturation]);

    const [lightness, setLightness] = usePicker(lightnessRef, initialColor.lightness, 0, 100);
    useEffect(() => onChange(hslToHex(hue, saturation, lightness)), [lightness]);

    useEffect(() => {
        const canvas = hueRef.current;
        const parent = canvas.parentElement;
        const bounds = parent.getBoundingClientRect();

        canvas.width = bounds.width;

        const context = canvas.getContext("2d");

        const multiplier = canvas.width / 360;

        for (let index = 0; index < 360; index++) {
            context.fillStyle = `hsl(${index}, ${saturation}%, ${lightness}%)`;
            context.fillRect(Math.floor(index * multiplier), 0, Math.ceil(multiplier), canvas.height);
        }
    }, [hueRef, saturation, lightness]);

    useEffect(() => {
        const canvas = saturationRef.current;
        const parent = canvas.parentElement;
        const bounds = parent.getBoundingClientRect();

        canvas.width = bounds.width;

        const context = canvas.getContext("2d");

        const multiplier = canvas.width / 100;

        for (let index = 0; index < 100; index++) {
            context.fillStyle = `hsl(${hue}, ${index}%, ${lightness}%)`;
            context.fillRect(Math.floor(index * multiplier), 0, Math.ceil(multiplier), canvas.height);
        }
    }, [saturationRef, hue, lightness]);

    useEffect(() => {
        const canvas = lightnessRef.current;
        const parent = canvas.parentElement;
        const bounds = parent.getBoundingClientRect();

        canvas.width = bounds.width;

        const context = canvas.getContext("2d");

        const multiplier = canvas.width / 100;

        for (let index = 0; index < 100; index++) {
            context.fillStyle = `hsl(${hue}, ${saturation}%, ${index}%)`;
            context.fillRect(Math.floor(index * multiplier), 0, Math.ceil(multiplier), canvas.height);
        }
    }, [lightnessRef, hue, saturation]);

    return (
        <div style={{ display: "flex", gap: "1em", flexDirection: "column" }}>
            <div className="color">
                <div className="header">
                    <label htmlFor="hue">Hue</label>

                    <input id="hue" type="number" value={hue} min="0" max="360" onChange={(event) => setHue(Math.min(Math.max(Math.round(event.target.value), 0), 360))} />
                </div>

                <div className="picker">
                    <canvas ref={hueRef} className="picker-canvas" height={24} />

                    <div className="picker-slider" style={{
                        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        left: `${hue / 360 * 100}%`
                    }} />
                </div>
            </div>

            <div className="color">
                <div className="header">
                    <label htmlFor="saturation">Saturation</label>

                    <input id="saturation" type="number" value={saturation} min="0" max="100" onChange={(event) => setSaturation(Math.min(Math.max(Math.round(event.target.value), 0), 100))} />
                </div>

                <div className="picker">
                    <canvas ref={saturationRef} className="picker-canvas" height={24} />

                    <div className="picker-slider" style={{
                        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        left: `${saturation}%`
                    }} />
                </div>
            </div>

            <div className="color">
                <div className="header">
                    <label htmlFor="lightness">Lightness</label>

                    <input id="lightness" type="number" value={lightness} min="0" max="100" onChange={(event) => setLightness(Math.min(Math.max(Math.round(event.target.value), 0), 100))} />
                </div>

                <div className="picker">
                    <canvas ref={lightnessRef} className="picker-canvas" height={24} />

                    <div className="picker-slider" style={{
                        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        left: `${lightness}%`
                    }} />
                </div>
            </div>
        </div>
    );
};
