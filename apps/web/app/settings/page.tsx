"use client";

import { ApiKeyManager } from "@/components/api-key-manager";
import BackgroundSettings from "@/components/background-settings";
import DataManager from "@/components/data-manager";
import { useBackground } from "@/contexts/background-context";

export default function SettingsPage() {
  const { backgroundImage } = useBackground();

  return (
    <div className="neo-container min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="neo-heading neo-heading-black text-4xl mb-4">SETTINGS</h1>
          <p className="neo-text neo-text-black-color text-lg">CONFIGURE YOUR AI API SETTINGS AND CUSTOMIZE YOUR EDITOR EXPERIENCE</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="neo-card p-6">
            <ApiKeyManager />
          </div>
          <div className="neo-card p-6">
            <BackgroundSettings />
          </div>
        </div>

        {/* Data Management Section */}
        <div className="mt-8">
          <div className="neo-card p-6">
            <h2 className="neo-heading neo-heading-black text-xl mb-4">DATA MANAGEMENT</h2>
            <p className="neo-text neo-text-black-color mb-4">
              EXPORT YOUR DATA OR MANAGE STORAGE WITH THE NEW INDEXEDDB SYSTEM.
            </p>
            <DataManager />
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="neo-button neo-button-primary inline-flex items-center px-6 py-3"
          >
            <span className="neo-text">← BACK TO EDITOR</span>
          </a>
        </div>
      </div>
    </div>
  );
}
