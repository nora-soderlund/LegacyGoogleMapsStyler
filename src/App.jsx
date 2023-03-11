import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "./map/Map";
import "./App.css";
import ColorPicker, { hexToHsl, hslToHex } from "./colorPicker/ColorPicker";
import { useEffect, useRef, useState } from "react";

import data from "./data.json";

function App() {
    const [ image, setImage ] = useState(null);
    const [ shiftDown, setShiftDown ] = useState(false);
    const [ mapRectangle, setMapRectangle ] = useState({ left: "25%", top: "25%", width: "50%", height: "50%" });
    const [ styles, setStyles ] = useState({});
    const drawAreaRef = useRef();

    function downloadImage(event) {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                setImage(event.target.result);
            };
            
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const [ groupColors, setGroupColors ] = useState([]);

    function setGroupColor(index, color) {
        setGroupColors([
            ...groupColors.filter((x) => x.index !== index),
            { index, color }
        ]);
    };

    useEffect(() => {
        const featureTypes = [];

        data.groups.forEach((group, index) => {
            group.keys.forEach((featureType) => {
                const value = data.featureTypes[featureType];
                const subEntries = Object.entries(value);

                subEntries.forEach(([elementType, value]) => {
                    let color = groupColors.find((x) => x.index === index)?.color ?? group.original;

                    if(elementType === "geometry.stroke") {
                        const hsl = hexToHsl(color);
                        
                        color = hslToHex(hsl.hue, hsl.saturation, hsl.lightness - (hsl.lightness / 3));
                    }

                    featureTypes.push({
                        featureType,
                        elementType,

                        stylers: [{
                            color
                        }]
                    });
                });
            });
        });

        setStyles(featureTypes);
    }, [ groupColors ]);

    window.addEventListener("keydown", (event) => {
        if(!event.shiftKey)
            return;

        setShiftDown(true);
    });

    window.addEventListener("keyup", (event) => {
        if(event.shiftKey)
            return;

        setShiftDown(false);
    });

    return (
        <Wrapper apiKey="API_KEY">
            <div className="app">
                <div style={{
                    flexGrow: 1,

                    position: "relative",

                    height: "100%",
                    overflow: "hidden"
                }}>
                    {(image) && (
                        <div ref={drawAreaRef} style={{
                            position: "absolute",

                            left: 0,
                            top: 0,

                            width: "100%",
                            height: "100%",

                            display: "flex",

                            justifyContent: "center",
                            alignItems: "center",

                            overflow: "hidden"
                        }}
                            onMouseDown={(event) => {
                                if(!shiftDown)
                                    return;
                                    
                                const bounds = drawAreaRef.current.getBoundingClientRect();
                        
                                const newMapRectangle = {
                                    ...mapRectangle,
                        
                                    left: `${(event.nativeEvent.offsetX / bounds.width) * 100}%`,
                                    top: `${(event.nativeEvent.offsetY / bounds.height) * 100}%`
                                };
                        
                                setMapRectangle(newMapRectangle);
                            }}
                        >
                            <img alt="hello" src={image} style={{
                                maxHeight: "100%",
                                maxWidth: "100%",

                                userSelect: "none",
                                pointerEvents: "none"
                            }}/>
                        </div>
                    )}

                    <div style={(image)?({
                        position: "relative",

                        left: mapRectangle.left,
                        top: mapRectangle.top,

                        height: mapRectangle.height,
                        width: mapRectangle.width,

                        border: "2px solid black",

                        resize: "both",
                        overflow: "hidden",

                        opacity: (shiftDown)?(0.25):(1.0),
                        pointerEvents: (shiftDown)?("none"):("auto")
                    }):({
                        height: "100%"
                    })}>
                        <Map styles={styles}/>
                    </div>
                </div>

                <div className="controls">
                    <form>
                        <h2><label htmlFor="image">Background cover</label></h2>
                        <p><label htmlFor="image">Choose an image to have as an underlay to the map to see the contrast difference in real time.</label></p>
                        
                        <input id="image" type="file" onChange={(event) => downloadImage(event)}/>

                        <p><small>Hold shift and draw a rectangle where you want the map.</small></p>
                    </form>

                    <hr/>

                    {(data.groups.map((group, index) => (
                        <div key={index}>
                            <h3>{group.text} <span style={{ fontWeight: "normal", fontSize: ".7em" }}>{group.subText}</span></h3>

                            <ColorPicker color={groupColors.find((x) => x.index === index)?.color ?? group.original} onChange={(color) => setGroupColor(index, color)}/>

                            <hr/>
                        </div>
                    )))}

                    <code style={{
                        display: "block",

                        height: "40%",
                        width: "100%",

                        overflow: "auto"
                    }}>
                        <pre>{JSON.stringify(styles, null, 4)}</pre>
                    </code>
                </div>
            </div>
        </Wrapper>
    );
};

export default App;
