"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UserLocationState } from "@/types/navigation";

// Exact OpenStreetMap MAIN GATE node coordinates near SNS Clinic & Technology Campus
export const SNS_CAMPUS_GATE = {
  latitude: 11.100776,
  longitude: 77.025960,
};

export const AI_CAMPUS_ENTRANCE = {
  latitude: 11.103462,
  longitude: 77.027298,
};

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    latitude: SNS_CAMPUS_GATE.latitude,
    longitude: SNS_CAMPUS_GATE.longitude,
    accuracy: 10,
    loading: false,
    error: null,
  });
  const [isDemoLocation, setIsDemoLocation] = useState<boolean>(true);
  const isManuallyPinnedRef = useRef<boolean>(true);

  // Single stable GPS location request without continuous jumping
  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        latitude: SNS_CAMPUS_GATE.latitude,
        longitude: SNS_CAMPUS_GATE.longitude,
        accuracy: 10,
        loading: false,
        error: "GPS unavailable. Starting at SNS Main Gate.",
      });
      setIsDemoLocation(true);
      isManuallyPinnedRef.current = true;
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    isManuallyPinnedRef.current = false;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 5000,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      // Ignore if user has manually set a start point
      if (isManuallyPinnedRef.current) return;

      const { latitude, longitude, accuracy } = position.coords;

      // Check distance from SNS Campus Main Gate
      const distFromCampus = Math.sqrt(
        Math.pow(latitude - SNS_CAMPUS_GATE.latitude, 2) +
          Math.pow(longitude - SNS_CAMPUS_GATE.longitude, 2)
      );

      // If device GPS is outside campus bounds (> 1.5km away e.g. PC ISP IP location or indoor weak fix)
      if (distFromCampus > 0.015) {
        setState({
          latitude: SNS_CAMPUS_GATE.latitude,
          longitude: SNS_CAMPUS_GATE.longitude,
          accuracy: 10,
          loading: false,
          error:
            "Device location is outside campus or indoor weak GPS fix. Started at SNS Main Gate.",
        });
        setIsDemoLocation(true);
        isManuallyPinnedRef.current = true;
      } else {
        setState({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: accuracy > 80 ? `Indoor GPS weak (±${Math.round(accuracy)}m). Started at nearest point.` : null,
        });
        setIsDemoLocation(false);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve device GPS.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "GPS permission denied. Starting at SNS Main Gate.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "GPS position unavailable indoors. Starting at SNS Main Gate.";
          break;
        case error.TIMEOUT:
          errorMessage = "GPS request timed out indoors. Starting at SNS Main Gate.";
          break;
      }

      setState({
        latitude: SNS_CAMPUS_GATE.latitude,
        longitude: SNS_CAMPUS_GATE.longitude,
        accuracy: 10,
        loading: false,
        error: errorMessage,
      });
      setIsDemoLocation(true);
      isManuallyPinnedRef.current = true;
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  const setCampusDemoLocation = useCallback(() => {
    isManuallyPinnedRef.current = true;
    setState({
      latitude: SNS_CAMPUS_GATE.latitude,
      longitude: SNS_CAMPUS_GATE.longitude,
      accuracy: 5,
      loading: false,
      error: null,
    });
    setIsDemoLocation(true);
  }, []);

  const setAICampusLocation = useCallback(() => {
    isManuallyPinnedRef.current = true;
    setState({
      latitude: AI_CAMPUS_ENTRANCE.latitude,
      longitude: AI_CAMPUS_ENTRANCE.longitude,
      accuracy: 5,
      loading: false,
      error: null,
    });
    setIsDemoLocation(true);
  }, []);

  const setCustomLocation = useCallback((lat: number, lng: number) => {
    isManuallyPinnedRef.current = true;
    setState({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      accuracy: 3,
      loading: false,
      error: null,
    });
    setIsDemoLocation(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [requestLocation]);

  return {
    ...state,
    isDemoLocation,
    requestLocation,
    setCampusDemoLocation,
    setAICampusLocation,
    setCustomLocation,
  };
}
