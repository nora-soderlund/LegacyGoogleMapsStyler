import { useEffect, useRef, useState } from "react";

import "./Map.css";

export default function Map({ styles }) {
    const ref = useRef();
    const [ map, setMap ] = useState(null);

    useEffect(() => {
        setMap(new window.google.maps.Map(ref.current, {
            center: { lat: 58.3797077874133, lng: 12.324640529544448 },
            zoom: 12,
            styles
        }));
    }, []);

    useEffect(() => {
        if(!map)
            return;
            
        map.setOptions({
            styles
        });
    }, [ styles ]);

    return (
        <div className="map" ref={ref}/>
    );
};
