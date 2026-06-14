"use client";

import React from "react";

interface AdminTabProps {
  handleExportConfig: () => void;
  handleImportConfig: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFactoryReset: () => void;
}

export default function AdminTab({
  handleExportConfig,
  handleImportConfig,
  handleFactoryReset,
}: AdminTabProps) {
  return (
    <div className="flex flex-col gap-6 anim-fade-up">
      <div className="flex flex-col gap-1 border-b border-zinc-800 pb-4">
        <h3 className="text-base font-semibold text-white">Admin Console</h3>
        <p className="text-xs text-zinc-500">
          Export configuration backups, load settings files, or restore application factory state.
        </p>
      </div>

      <div className="typographic-form">
        {/* Export & Import */}
        <div className="settings-form-row">
          <span className="row-num">01 /</span>
          <div className="row-content">
            <label className="row-label">Configuration Backups</label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={handleExportConfig}
                className="custom-btn custom-btn-accent text-xs font-mono py-2.5 px-4 flex-1 flex items-center justify-center gap-2"
              >
                Export JSON Backup
              </button>
              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                  id="import-config-file"
                />
                <label
                  htmlFor="import-config-file"
                  className="custom-btn custom-btn-secondary text-xs font-mono py-2.5 px-4 block text-center cursor-pointer hover:border-zinc-500"
                >
                  Import JSON Backup
                </label>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono block mt-2">
              Import files must match the version 1 schema definition.
            </span>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="settings-form-row">
          <span className="row-num">02 /</span>
          <div className="row-content">
            <label className="row-label text-rose-500">Emergency Reset</label>
            <p className="text-xs text-zinc-500 mt-1 mb-3">
              Wipes all cached credentials, focus group personas, evaluation metrics, and local styling variables. Wiped data cannot be retrieved.
            </p>
            <button
              onClick={handleFactoryReset}
              className="custom-btn bg-transparent hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 border border-rose-800 hover:border-rose-600 text-xs font-mono font-bold py-2.5 px-6 transition-all"
              style={{ borderRadius: 0 }}
            >
              Factory Reset Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
