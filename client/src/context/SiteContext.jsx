import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";
import * as siteApi from "../services/site";
import { useAuth } from "./AuthContext";

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);

export function SiteProvider({ children }) {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [features, setFeatures] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshConfig = useCallback(() => {
    // Cache-bust so admin edits reach open tabs immediately.
    api.get("/config", { params: { t: Date.now() } }).then((r) => setConfig(r.data)).catch(() => {});
  }, []);

  const refreshFeatures = useCallback(() => {
    if (!user) {
      setFeatures(null);
      setRequests([]);
      setIsAdmin(false);
      return Promise.resolve();
    }
    return siteApi.getFeatures()
      .then((data) => {
        setFeatures(data.features || {});
        setRequests(data.requests || []);
        setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => { refreshConfig(); }, [refreshConfig]);
  useEffect(() => {
    refreshFeatures();
    const onChanged = () => refreshFeatures();
    window.addEventListener("features:changed", onChanged);
    return () => window.removeEventListener("features:changed", onChanged);
  }, [user, refreshFeatures]);

  // While features are loading, allow content to render; never hide data briefly.
  const can = (key) => !features || features[key] !== false;
  const request = async (feature, note = "") => {
    await siteApi.requestFeature(feature, note);
    const data = await siteApi.getFeatures();
    setFeatures(data.features || {});
    setRequests(data.requests || []);
    window.dispatchEvent(new Event("features:changed"));
  };

  return (
    <Ctx.Provider value={{
      config, features, requests, isAdmin, can, request,
      refreshConfig, refreshFeatures,
      setConfig, setIsAdmin,
    }}>
      {children}
    </Ctx.Provider>
  );
}
