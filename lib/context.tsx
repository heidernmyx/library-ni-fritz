import { createContext } from "react";
import { fetchSession } from "@/lib/actions/fetchSession";



export const SessionContext = createContext(fetchSession);