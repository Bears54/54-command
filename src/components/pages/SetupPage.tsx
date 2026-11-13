import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Laptop,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Copy,
  Check,
  FileJson,
  Database,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useBinder } from '../../context/BinderContext';

export const SetupPage: React.FC = () => {
  const {
    theme,
    setTheme,
    toggleTheme,
    userProfile,
    updateUserProfile,
    backupToCloud,
    resetToSampleData,
    celebrate,
  } = useBinder();

  const [name, setName] = useState(userProfile.name);
  const [tagline, setTagline] = useState(userProfile.tagline);
  const [accent, setAccent] = useState(userProfile.accentPreference);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [pasteString, setPasteString] = useState('');
  const [showClipboardDrawer, setShowClipboardDrawer] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [storageStats, setStorageStats] = useState({
    totalKeys: 0,
    estimatedKb: 0,
    lastSaved: 'Just now',
  });

  const updateStats = () => {
    let count = 0;
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lifebinder') || key.startsWith('LifeBinder'))) {
        count++;
        const val = localStorage.getItem(key) || '';
        bytes += key.length + val.length;
      }
    }
    setStorageStats({
      totalKeys: count,
      estimatedKb: Math.round(bytes / 1024),
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  useEffect(() => {
    updateStats();
  }, []);

  const showNotification = (msg: string) => {
    setErrorMessage(null);
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleExportMasterBackup = () => {
    const backupPayload: Record<string, unknown> = {
      app: 'LifeBinder Command Center',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      platform: navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Desktop / Computer',
      storageData: {} as Record<string, string>,
    };

    const storageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lifebinder') || key.startsWith('LifeBinder'))) {
        const val = localStorage.getItem(key);
        if (val !== null) storageData[key] = val;
      }
    }
    backupPayload.storageData = storageData;

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeBinder_Master_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    celebrate();
    showNotification('Master backup file downloaded! Transfer this file to your other device.');
  };

  const handleImportFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processAndRestoreJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processAndRestoreJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);

      if (parsed.storageData && typeof parsed.storageData === 'object') {
        Object.entries(parsed.storageData).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        });
      } else if (parsed.data && typeof parsed.data === 'object') {
        Object.entries(parsed.data).forEach(([key, value]) => {
          localStorage.setItem(`lifebinder_data_v1_${key}`, JSON.stringify(value));
        });
      }

      updateStats();
      celebrate();
      showNotification('Backup successfully restored! Refreshing command center...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      setErrorMessage('Error parsing backup JSON. Ensure the file or pasted string is a valid LifeBinder export.');
    }
  };

  const handleCopyBackupStringToClipboard = () => {
    const storageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('lifebinder') || key.startsWith('LifeBinder'))) {
        const val = localStorage.getItem(key);
        if (val !== null) storageData[key] = val;
      }
    }

    const backupPayload = {
      app: 'LifeBinder Command Center',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      storageData,
    };

    navigator.clipboard.writeText(JSON.stringify(backupPayload));
    setIsCopied(true);
    celebrate();
    setTimeout(() => setIsCopied(false), 3000);
    showNotification('Backup data copied to clipboard!');
  };

  const handlePasteStringRestore = () => {
    if (!pasteString.trim()) return;
    processAndRestoreJSON(pasteString.trim());
  };

  const handleManualBackup = async () => {
    setIsSyncing(true);
    await backupToCloud();
    setIsSyncing(false);
    updateStats();
    celebrate();
    showNotification('Local cloud snapshot successfully captured!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      tagline: tagline.trim(),
      accentPreference: accent,
    });
    celebrate();
    showNotification('Profile preferences updated!');
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Toast Feedback */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] text-xs font-semibold shadow-[0_0_24px_rgba(190,127,171,0.45)] border border-[#be7fab] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2] dark:border-[#be7fab]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/55 text-[#be7fab] dark:text-[#daabcb]">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1b28] dark:text-[#efd0e5] tracking-tight">
              Command Center Setup &amp; Cross-Device Sync
            </h1>
          </div>
          <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-1">
            Switch between Dark and Daylight Rose-Mauve Command Center themes, customize preferences, and transfer data cleanly
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/45 font-mono tabular-nums">
          <Database className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
          <span>{storageStats.totalKeys} keys · {storageStats.estimatedKb} KB saved</span>
        </div>
      </div>

      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#be7fab]/20 border border-[#be7fab] text-xs text-[#2d1b28] dark:text-[#efd0e5] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#be7fab] dark:text-[#efd0e5] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dark / Light Mode Appearance Panel */}
      <div className="hud-panel hud-corners washi-tape-top p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2] dark:border-[#be7fab]/25">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/50 text-[#be7fab] dark:text-[#daabcb] shadow-[0_0_16px_rgba(190,127,171,0.3)]">
              {isDark ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Appearance &amp; Theme Mode
              </h3>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
                Styled exclusively in your 5-shade rose-mauve palette and saved automatically in browser storage
              </p>
            </div>
          </div>

          {/* Interactive Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={!isDark}
            onClick={() => {
              toggleTheme();
              showNotification(
                `Switched to ${isDark ? 'Daylight Rose-Mauve Light Mode' : 'Command Center Dark Mode'}!`
              );
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#e6c3db] dark:bg-[#120a10] border border-[#be7fab] shadow-[0_0_16px_rgba(190,127,171,0.35)] transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              {isDark ? (
                <>
                  <Moon className="w-4 h-4 text-[#be7fab]" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-[#be7fab]" />
                  <span>Light Mode</span>
                </>
              )}
            </span>
            <span
              className={`flex items-center w-11 h-6 rounded-full p-1 transition-colors border ${
                isDark
                  ? 'bg-[#1c0f19] border-[#be7fab] justify-start'
                  : 'bg-white border-[#be7fab] justify-end'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#be7fab] shadow-[0_0_8px_#be7fab]" />
            </span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Option Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showNotification('Switched to Dark Mode (Command Center)!');
            }}
            className={`text-left p-4 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#120a10] border-[#be7fab] ring-2 ring-[#be7fab]/50 shadow-[0_0_24px_rgba(190,127,171,0.35)]'
                : 'bg-[#120a10] border-[#d29ec2] opacity-85 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#be7fab]/25 border border-[#be7fab] text-[#efd0e5] shadow-[0_0_12px_rgba(190,127,171,0.5)]">
                  <Moon className="w-4 h-4" />
                </span>
                <span className="font-display text-sm font-bold text-[#efd0e5]">
                  Dark Mode (Default Command Center)
                </span>
              </div>
              {isDark && (
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-[#be7fab] text-[#120a10]">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#e6c3db]/85 leading-relaxed">
              Deep plum-black (#120a10) canvas, translucent dark glass panels (#1c0f19), glowing #be7fab borders, and crisp #efd0e5 text.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {['#120a10', '#1c0f19', '#be7fab', '#d29ec2', '#efd0e5'].map((hex) => (
                <span
                  key={hex}
                  className="w-5 h-5 rounded-md border border-[#efd0e5]/30"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </button>

          {/* Light Mode Option Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showNotification('Switched to Light Mode (Daylight Rose-Mauve)!');
            }}
            className={`text-left p-4 rounded-2xl border transition-all ${
              !isDark
                ? 'bg-[#efd0e5] border-[#be7fab] ring-2 ring-[#be7fab]/50 shadow-[0_0_24px_rgba(190,127,171,0.3)]'
                : 'bg-[#efd0e5] border-[#daabcb] opacity-90 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#be7fab] text-[#120a10] shadow-[0_0_12px_rgba(190,127,171,0.45)]">
                  <Sun className="w-4 h-4" />
                </span>
                <span className="font-display text-sm font-bold text-[#2d1b28]">
                  Light Mode (Daylight Rose-Mauve)
                </span>
              </div>
              {!isDark && (
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-[#be7fab] text-[#120a10]">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#2d1b28]/85 leading-relaxed">
              Lightest blush pink (#efd0e5) backdrop, crisp #ffffff panels, soft petal (#e6c3db) inner sections, and high-contrast #2d1b28 ink.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {['#efd0e5', '#ffffff', '#e6c3db', '#d29ec2', '#be7fab', '#2d1b28'].map((hex) => (
                <span
                  key={hex}
                  className="w-5 h-5 rounded-md border border-[#2d1b28]/25"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Export / Import Master Panel */}
      <div className="hud-panel hud-corners washi-tape-top p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#d29ec2] dark:border-[#be7fab]/25">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#be7fab]/20 border border-[#be7fab]/45 text-[#be7fab] dark:text-[#daabcb]">
              <FileJson className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Cross-Device Data Transfer (Computer ↔ iPhone)
              </h3>
              <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/80 mt-0.5">
                Export your entire LifeBinder database to JSON, or import a saved backup to resume right where you left off
              </p>
            </div>
          </div>

          <button
            onClick={handleManualBackup}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#120a10] hover:bg-[#be7fab]/30 border border-[#d29ec2] dark:border-[#be7fab]/45 rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Capture Snapshot</span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Export Backup */}
          <button
            onClick={handleExportMasterBackup}
            className="flex flex-col items-start p-4 rounded-xl bg-[#be7fab] hover:bg-[#d29ec2] text-[#120a10] shadow-[0_0_20px_rgba(190,127,171,0.35)] transition-all active:scale-98 text-left"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-[#120a10]/20 text-[#120a10]">
                <Download className="w-5 h-5" />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono bg-[#120a10]/20 px-2 py-0.5 rounded font-bold">
                JSON File
              </span>
            </div>
            <h4 className="font-display text-sm font-bold text-[#120a10]">
              Export Backup
            </h4>
            <p className="text-[11px] text-[#120a10]/85 mt-1 leading-snug font-medium">
              Downloads a master file with all binder tabs, finance accounts, measurements, recipes, and rooms.
            </p>
          </button>

          {/* Import Backup */}
          <label className="flex flex-col items-start p-4 rounded-xl bg-[#e6c3db]/75 dark:bg-[#120a10]/85 hover:bg-[#e6c3db] dark:hover:bg-[#241420] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] transition-all active:scale-98 cursor-pointer group text-left">
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb] group-hover:bg-[#be7fab] group-hover:text-[#120a10] transition-colors">
                <Upload className="w-5 h-5" />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono bg-[#be7fab]/25 px-2 py-0.5 rounded text-[#2d1b28] dark:text-[#daabcb] font-bold">
                Restore
              </span>
            </div>
            <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Import Backup
            </h4>
            <p className="text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 mt-1 leading-snug">
              Select a previously exported LifeBinder backup file to restore your saved data onto this device.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFileChosen}
              className="hidden"
            />
          </label>

          {/* Clipboard Sync */}
          <button
            onClick={() => setShowClipboardDrawer(!showClipboardDrawer)}
            className="flex flex-col items-start p-4 rounded-xl bg-[#e6c3db]/75 dark:bg-[#120a10]/85 hover:bg-[#e6c3db] dark:hover:bg-[#241420] border border-[#d29ec2] dark:border-[#be7fab]/45 text-[#2d1b28] dark:text-[#efd0e5] transition-all active:scale-98 text-left"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="p-2 rounded-lg bg-[#be7fab]/25 text-[#be7fab] dark:text-[#daabcb]">
                <Copy className="w-5 h-5" />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono bg-[#be7fab]/25 px-2 py-0.5 rounded text-[#2d1b28] dark:text-[#daabcb] font-bold">
                AirDrop / Text
              </span>
            </div>
            <h4 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Copy / Paste Data String
            </h4>
            <p className="text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 mt-1 leading-snug">
              Transfer data directly between your Mac and iPhone without downloading files using clipboard sync.
            </p>
          </button>
        </div>

        {showClipboardDrawer && (
          <div className="mt-4 p-4 rounded-xl bg-[#e6c3db]/70 dark:bg-[#120a10]/90 border border-[#d29ec2] dark:border-[#be7fab]/40 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#2d1b28] dark:text-[#efd0e5]">
                Clipboard Backup Sync (No file download needed)
              </span>
              <button
                onClick={handleCopyBackupStringToClipboard}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#be7fab] text-[#120a10] rounded-lg hover:bg-[#d29ec2]"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Entire Backup to Clipboard'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80 mb-1">
                Or paste backup text copied from your computer or iPhone:
              </label>
              <textarea
                value={pasteString}
                onChange={(e) => setPasteString(e.target.value)}
                rows={3}
                placeholder="Paste backup JSON string here..."
                className="w-full p-2 text-xs font-mono bg-white dark:bg-[#1c0f19] text-[#2d1b28] dark:text-[#efd0e5] placeholder:text-[#2d1b28]/45 dark:placeholder:text-[#d29ec2]/50 border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-lg focus:outline-none focus:border-[#be7fab]"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePasteStringRestore}
                disabled={!pasteString.trim()}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#be7fab] hover:bg-[#d29ec2] disabled:opacity-40 text-[#120a10] rounded-lg transition-all"
              >
                Restore Pasted Data
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-[#d29ec2] dark:border-[#be7fab]/25 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#2d1b28] dark:text-[#e6c3db]">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#e6c3db]/70 dark:bg-[#120a10]/70 border border-[#d29ec2] dark:border-[#be7fab]/25">
            <Smartphone className="w-5 h-5 text-[#be7fab] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2d1b28] dark:text-[#efd0e5] block mb-0.5">iPhone / Mobile Safari Instructions</strong>
              <p className="leading-relaxed text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                Tap Safari <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Share</strong> → select <strong className="text-[#2d1b28] dark:text-[#efd0e5]">"Add to Home Screen"</strong> for a full-screen command center with touch gestures and persistent storage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#e6c3db]/70 dark:bg-[#120a10]/70 border border-[#d29ec2] dark:border-[#be7fab]/25">
            <Laptop className="w-5 h-5 text-[#be7fab] dark:text-[#daabcb] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2d1b28] dark:text-[#efd0e5] block mb-0.5">Desktop &amp; Cloud Mobility</strong>
              <p className="leading-relaxed text-[11px] text-[#2d1b28]/80 dark:text-[#e6c3db]/80">
                Use <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Export Backup</strong> before switching computers, then tap <strong className="text-[#2d1b28] dark:text-[#efd0e5]">Import Backup</strong> to restore all command hubs instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Preferences */}
      <div className="hud-panel hud-corners p-6">
        <h3 className="font-display text-base font-bold text-[#2d1b28] dark:text-[#efd0e5] pb-3 border-b border-[#d29ec2] dark:border-[#be7fab]/25 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#be7fab] dark:text-[#daabcb]" />
          <span>Personal Preferences &amp; Identity</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl focus:outline-none focus:border-[#be7fab]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] mb-1">
              Personal Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#efd0e5]/55 dark:bg-[#120a10] text-[#2d1b28] dark:text-[#efd0e5] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl focus:outline-none focus:border-[#be7fab]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] mb-1">
              Command Illumination Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rose-teal', label: 'Berry Pulse', c1: '#be7fab', c2: '#efd0e5' },
                { id: 'teal-rose', label: 'Mauve Halo', c1: '#d29ec2', c2: '#daabcb' },
                { id: 'warm-gold', label: 'Blush Glow', c1: '#efd0e5', c2: '#be7fab' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAccent(opt.id as typeof accent)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    accent === opt.id
                      ? 'bg-[#be7fab]/25 border-[#be7fab] text-[#2d1b28] dark:text-[#efd0e5] ring-1 ring-[#be7fab]'
                      : 'bg-[#e6c3db]/60 dark:bg-[#120a10]/80 border-[#d29ec2] dark:border-[#be7fab]/30 text-[#2d1b28]/80 dark:text-[#e6c3db]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-[#2d1b28]/20" style={{ backgroundColor: opt.c1 }} />
                  <span className="w-3 h-3 rounded-full border border-[#2d1b28]/20" style={{ backgroundColor: opt.c2 }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl shadow-[0_0_14px_rgba(190,127,171,0.4)] transition-all"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Reset Zone with inline two-step confirm */}
      <div className="hud-panel hud-corners p-6 border-[#be7fab]/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-sm font-bold text-[#2d1b28] dark:text-[#efd0e5]">
              Reset LifeBinder to Sample Data
            </h3>
            <p className="text-xs text-[#2d1b28]/75 dark:text-[#e6c3db]/75 mt-0.5">
              Restores initial fresh state with sample habits, priorities, meals, and health entries
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetToSampleData();
                  setConfirmReset(false);
                  celebrate();
                  updateStats();
                  showNotification('Sample data restored!');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#120a10] bg-[#be7fab] hover:bg-[#d29ec2] rounded-xl transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 text-xs font-semibold text-[#2d1b28] dark:text-[#e6c3db] bg-[#e6c3db] dark:bg-[#120a10] border border-[#d29ec2] dark:border-[#be7fab]/40 rounded-xl"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#2d1b28] dark:text-[#efd0e5] bg-[#e6c3db] dark:bg-[#be7fab]/20 hover:bg-[#be7fab]/35 rounded-xl border border-[#be7fab]/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#be7fab] dark:text-[#daabcb]" />
              <span>Reset to Sample Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
