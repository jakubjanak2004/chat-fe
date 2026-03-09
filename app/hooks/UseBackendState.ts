import { useEffect, useState } from "react";
import {backendState} from "../context/BackendState";

// todo maybe return a dict instead of one value, as that is the better practice
export function useBackendStatus() {
    const [state, setState] = useState(backendState.current);

    useEffect(() => {
        return backendState.subscribe(setState);
    }, []);

    return state;
}