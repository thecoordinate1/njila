// src/components/otw/RouteOptimizationForm.tsx
"use client";

import type { VehicleType } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarFront, Bike, Sparkles, AlertTriangle } from "lucide-react";

interface RouteOptimizationFormProps {
  vehicleType: VehicleType;
  onVehicleTypeChange: (value: VehicleType) => void;
  onOptimizeRoute: () => void;
  isLoading: boolean;
  selectedOrderCount: number;
}

export function RouteOptimizationForm({
  vehicleType,
  onVehicleTypeChange,
  onOptimizeRoute,
  isLoading,
  selectedOrderCount,
}: RouteOptimizationFormProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Optimize Delivery Route</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="vehicleType" className="text-base font-medium mb-2 block">Select Vehicle Type:</Label>
          <RadioGroup
            id="vehicleType"
            value={vehicleType}
            onValueChange={(value) => onVehicleTypeChange(value as VehicleType)}
            className="flex space-x-4"
            aria-label="Vehicle type"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="car" id="car" />
              <Label htmlFor="car" className="flex items-center cursor-pointer">
                <CarFront className="mr-2 h-5 w-5" /> Car
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bike" id="bike" />
              <Label htmlFor="bike" className="flex items-center cursor-pointer">
                <Bike className="mr-2 h-5 w-5" /> Bike
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {selectedOrderCount === 0 && (
           <div className="flex items-center p-3 rounded-md bg-yellow-50 border border-yellow-300 text-yellow-700">
             <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
             <p className="text-sm">Please select at least one order to optimize.</p>
           </div>
        )}

        <Button
          onClick={onOptimizeRoute}
          disabled={isLoading || selectedOrderCount === 0}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Optimize selected routes"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Optimize Route ({selectedOrderCount} {selectedOrderCount === 1 ? 'order' : 'orders'})
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
