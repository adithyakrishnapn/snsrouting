"use client";

import { useState, useCallback, useEffect } from "react";
import { UserLocationState } from "@/types/navigation";

// Default SNS College of Engineering, Coimbatore Main Entrance coordinates
export const SNS_CAMPUS_GATE = {
  latitude: 11.101850,
  longitude: 77.025400,
};

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
  });
  const [isDemoLocation, setIsDemoLocation] = useState<boolean>(false);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setState({
        latitude: SNS_CAMPUS_GATE.latitude,
        longitude: SNS_CAMPUS_GATE.longitude,
        accuracy: 10,
        loading: false,
        error: "Geolocation is not supported by your browser. Defaulting to SNS Main Campus Entrance.",
      });
      setIsDemoLocation(true);
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      let warningMessage: string | null = null;

      // Check distance from SNS Campus (~11.1018, 77.0254)
      const distFromCampus = Math.sqrt(
        Math.pow(latitude - SNS_CAMPUS_GATE.latitude, 2) +
          Math.pow(longitude - SNS_CAMPUS_GATE.longitude, 2)
      );

      // If user is more than ~0.05 degrees away (approx > 5km, e.g. PC ISP location)
      if (distFromCampus > 0.05) {
        warningMessage = "PC/Browser location is outside SNS Campus. You can switch to SNS Campus Entrance for an accurate campus navigation demo.";
      } else if (accuracy > 100) {
        warningMessage = `GPS accuracy is low (±${Math.round(accuracy)}m). Route may have slight variance.`;
      }

      setState({
        latitude,
        longitude,
        accuracy,
        loading: false,
        error: warningMessage,
      });
      setIsDemoLocation(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to retrieve GPS position.";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "Location permission denied. Switched to SNS Main Gate demo position.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location unavailable. Defaulting to SNS Campus Gate.";
          break;
        case error.TIMEOUT:
          errorMessage = "GPS request timed out. Using campus entrance position.";
          break;
      }

      // Fallback to SNS Campus Gate so user can test navigation anytime
      setState({
        latitude: SNS_CAMPUS_GATE.latitude,
        longitude: SNS_CAMPUS_GATE.longitude,
        accuracy: 15,
        loading: false,
        error: errorMessage,
      });
      setIsDemoLocation(true);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  const setCampusDemoLocation = useCallback(() => {
    setState({
      latitude: SNS_CAMPUS_GATE.latitude,
      longitude: SNS_CAMPUS_GATE.longitude,
      accuracy: 10,
      loading: false,
      error: null,
    });
    setIsDemoLocation(true);
  }, []);

  const setCustomLocation = useCallback((lat: number, lng: number) => {
    setState({
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      loading: false,
      error: null,
    });
    setIsDemoLocation(true);
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    isDemoLocation,
    requestLocation,
    setCampusDemoLocation,
    setCustomLocation,
  };
}

