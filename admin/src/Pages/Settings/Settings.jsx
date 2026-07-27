import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    platformName: "MockPrep",
    aiModel: "claude-opus · feedback tuned",
    uploads: true,
  });

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] px-6 py-6">

      {/* Header */}

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Platform configuration.
        </p>
      </div>

      {/* Card */}

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        {/* Platform */}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-800">
            Platform name
          </label>

          <input
            name="platformName"
            value={settings.platformName}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#2149D8]"
          />
        </div>

        {/* AI */}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-800">
            Default AI model
          </label>

          <input
            name="aiModel"
            value={settings.aiModel}
            onChange={handleChange}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-[#2149D8]"
          />
        </div>

        {/* Toggle */}

        <div className="flex items-center justify-between border-t border-slate-200 py-4">

          <div>
            <p className="text-sm font-medium text-slate-800">
              Allow document uploads
            </p>

            <p className="text-xs text-slate-500">
              Students can attach statements & CVs
            </p>
          </div>

          <button
            onClick={() =>
              setSettings({
                ...settings,
                uploads: !settings.uploads,
              })
            }
            className={`relative h-6 w-11 rounded-full transition ${
              settings.uploads ? "bg-[#2149D8]" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                settings.uploads ? "left-5" : "left-0.5"
              }`}
            />
          </button>

        </div>

        {/* Button */}

        <button className="mt-2 rounded-lg bg-[#2149D8] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#1b3db7]">
          Save changes
        </button>

      </div>

    </div>
  );
}