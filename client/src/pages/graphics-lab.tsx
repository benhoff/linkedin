import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GraphicsLab() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              Graphics Lab
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Generate visual concept prompts for your content.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Graphics Lab is under development and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              The Graphics Lab will generate visual concept prompts based on your content that you can use with your favorite image generation tools.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
