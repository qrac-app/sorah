"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

import type { ProjectDoc } from "./types";

type PreviewTabContentProps = {
  project: ProjectDoc;
  projectId: Id<"projects">;
};

export function PreviewTabContent({ project }: PreviewTabContentProps) {
  const getSandboxPreviewUrl = useAction(api.render.getSandboxPreviewUrl);
  const startDevServer = useAction(api.render.startDevServer);
  const stopDevServer = useAction(api.render.stopDevServer);
  const checkProcessStatus = useAction(api.render.checkProcessStatus);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPort, setPreviewPort] = useState(3000);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [devCommand, setDevCommand] = useState("bun run dev");
  const [devServerRunning, setDevServerRunning] = useState(false);
  const [startingServer, setStartingServer] = useState(false);
  const [stoppingServer, setStoppingServer] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const sandboxId = project.sandboxId;

  const loadPreviewUrl = useCallback(
    async (port: number = 3000) => {
      if (!sandboxId) return;

      setLoadingPreview(true);
      try {
        const result = await getSandboxPreviewUrl({ sandboxId, port });
        if (result.success && "previewUrl" in result) {
          let url = result.previewUrl || null;
          // Ensure the URL has a protocol (https://)
          if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
          }
          setPreviewUrl(url);
          setShowPreview(true);
        }
      } catch (error) {
        console.error("Failed to get preview URL:", error);
      } finally {
        setLoadingPreview(false);
      }
    },
    [getSandboxPreviewUrl, sandboxId]
  );

  const checkDevServerStatus = useCallback(async () => {
    if (!sandboxId) return;

    setCheckingStatus(true);
    try {
      const result = await checkProcessStatus({ sandboxId, processPattern: "bun" });
      if (result.success && "isRunning" in result) {
        setDevServerRunning(result.isRunning || false);
      }
    } catch (error) {
      console.error("Failed to check dev server status:", error);
    } finally {
      setCheckingStatus(false);
    }
  }, [checkProcessStatus, sandboxId]);

  const handleStartDevServer = useCallback(async () => {
    if (!sandboxId) return;

    setStartingServer(true);
    try {
      const result = await startDevServer({ sandboxId, command: devCommand });
      if (result.success) {
        setTimeout(() => {
          checkDevServerStatus();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to start dev server:", error);
    } finally {
      setStartingServer(false);
    }
  }, [startDevServer, sandboxId, devCommand, checkDevServerStatus]);

  const handleStopDevServer = useCallback(async () => {
    if (!sandboxId) return;

    setStoppingServer(true);
    try {
      await stopDevServer({ sandboxId });
      setDevServerRunning(false);
    } catch (error) {
      console.error("Failed to stop dev server:", error);
    } finally {
      setStoppingServer(false);
    }
  }, [stopDevServer, sandboxId]);

  useEffect(() => {
    if (sandboxId) {
      checkDevServerStatus();
      const interval = setInterval(checkDevServerStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [checkDevServerStatus, sandboxId]);

  if (!sandboxId) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="text-4xl mb-3">🚫</div>
        <p className="text-gray-700 font-medium mb-2">sandbox not available</p>
        <p className="text-sm text-gray-600">create a sandbox first from the "Sandbox State" tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dev Server Control */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{devServerRunning ? "🟢" : "⚫"}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">dev server</h3>
              <p className="text-sm text-gray-600">
                {devServerRunning ? "server is running" : "start the dev server to enable preview"}
              </p>
            </div>
          </div>
          <button
            onClick={checkDevServerStatus}
            disabled={checkingStatus}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {checkingStatus ? "checking..." : "check status"}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <label className="text-sm font-medium text-gray-700">command:</label>
          <input
            type="text"
            value={devCommand}
            onChange={(e) => setDevCommand(e.target.value)}
            placeholder="bun run dev"
            disabled={devServerRunning}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {!devServerRunning ? (
            <button
              onClick={handleStartDevServer}
              disabled={startingServer}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
            >
              {startingServer ? "starting..." : "start server"}
            </button>
          ) : (
            <button
              onClick={handleStopDevServer}
              disabled={stoppingServer}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
            >
              {stoppingServer ? "stopping..." : "stop server"}
            </button>
          )}
        </div>
      </div>

      {/* Preview Controls */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">🖥️</div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">sandbox preview</h3>
            <p className="text-sm text-gray-600">
              view the running application inside your e2b sandbox
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <label className="text-sm font-medium text-gray-700">port:</label>
          <input
            type="number"
            value={previewPort}
            onChange={(e) => setPreviewPort(parseInt(e.target.value) || 3000)}
            placeholder="Port"
            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => loadPreviewUrl(previewPort)}
            disabled={loadingPreview || !devServerRunning}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
          >
            {loadingPreview ? "loading..." : showPreview ? "refresh preview" : "load preview"}
          </button>
          {showPreview && (
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              hide preview
            </button>
          )}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              open in new tab ↗
            </a>
          )}
        </div>
        {!devServerRunning && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ start the dev server above before loading preview
            </p>
          </div>
        )}
      </div>

      {showPreview && previewUrl ? (
        <div className="bg-white rounded-lg border-2 border-purple-300 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono">{previewUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="w-full h-[700px] border-0"
            title="Sandbox Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-popups allow-modals"
          />
        </div>
      ) : (
        <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-700 font-medium mb-2">ready to preview</p>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            click "load preview" above to view your application. make sure your app is running on the
            specified port inside the sandbox.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-xs text-blue-800 font-mono">
              tip: common ports are 3000 (next.js), 8080 (http servers), 5173 (vite)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

