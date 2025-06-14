// src/components/otw/MapViewAndDirections.tsx
"use client";

import * as React from 'react';
import Image from 'next/image';
import type { OptimizedRouteResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapIcon, ListOrdered as ListOrderedIcon } from "lucide-react";

interface MapViewAndDirectionsProps {
  routeResult: OptimizedRouteResult;
}

export function MapViewAndDirections({ routeResult }: MapViewAndDirectionsProps) {
  if (!routeResult || !routeResult.directions || routeResult.directions.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg w-full mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <MapIcon className="mr-2 h-6 w-6 text-primary" />
          Route Map & Directions
        </CardTitle>
        <CardDescription>
          Visual overview of the route and step-by-step directions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium font-headline mb-2 flex items-center">
            Map Overview
          </h3>
          <div className="rounded-md overflow-hidden border">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Route map placeholder"
              width={600}
              height={400}
              className="w-full h-auto"
              data-ai-hint="route map"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">Note: This is a placeholder map.</p>
        </div>

        <div>
          <h3 className="text-lg font-medium font-headline mb-2 flex items-center">
            <ListOrderedIcon className="mr-2 h-5 w-5 text-primary" />
            Directions
          </h3>
          <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/50">
            <ol className="list-none space-y-2 text-sm">
              {routeResult.directions.map((direction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-primary font-semibold">{index + 1}.</span>
                  <span>{direction.replace(/^Step \d+: /, '')}</span>
                </li>
              ))}
            </ol>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
