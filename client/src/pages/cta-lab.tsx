import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CtaLab() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              CTA Lab
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Create powerful calls-to-action for your content.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The CTA Lab is under development and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              The CTA Lab will help you create powerful calls-to-action with options for Engagement, Download, Sign-Up, Share, and Feedback.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
