import { useEffect } from 'react';
import { matchesKeybinding } from '../lib/keybinding';
import { useSettingsStore } from '../stores/settings';
import type { TabId } from './constants';

interface UseAppKeyboardShortcutsOptions {
  activeWorktreePath: string | undefined;
  onTabSwitch: (tab: TabId) => void;
  onActionPanelToggle: () => void;
  onToggleWorktree: () => void;
  onToggleRepository: () => void;
  onSwitchActiveWorktree: () => void;
}

// 判断是否应跳过快捷键处理（可编辑场景、IME、快捷键录制）
function shouldSkipShortcut(e: KeyboardEvent): boolean {
  // IME 组合输入中
  if (e.isComposing) return true;

  const target = e.target as HTMLElement | null;
  if (!target) return false;

  // 快捷键录制模式
  if (target.hasAttribute('data-keybinding-recording')) return true;

  // 输入框、文本区域、可编辑元素
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if (target.isContentEditable) return true;

  return false;
}

export function useAppKeyboardShortcuts({
  activeWorktreePath: _activeWorktreePath,
  onTabSwitch,
  onActionPanelToggle,
  onToggleWorktree,
  onToggleRepository,
  onSwitchActiveWorktree,
}: UseAppKeyboardShortcutsOptions) {
  // Listen for Action Panel keyboard shortcut (Shift+Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldSkipShortcut(e)) return;
      if (e.key === 'p' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onActionPanelToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onActionPanelToggle]);

  // Listen for main tab switching keyboard shortcuts (capture phase to override xterm)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldSkipShortcut(e)) return;

      const bindings = useSettingsStore.getState().mainTabKeybindings;

      if (matchesKeybinding(e, bindings.switchToAgent)) {
        e.preventDefault();
        onTabSwitch('chat');
        return;
      }

      if (matchesKeybinding(e, bindings.switchToFile)) {
        e.preventDefault();
        onTabSwitch('file');
        return;
      }

      if (matchesKeybinding(e, bindings.switchToTerminal)) {
        e.preventDefault();
        onTabSwitch('terminal');
        return;
      }

      if (matchesKeybinding(e, bindings.switchToSourceControl)) {
        e.preventDefault();
        onTabSwitch('source-control');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onTabSwitch]);

  // Listen for workspace panel toggle shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldSkipShortcut(e)) return;

      const bindings = useSettingsStore.getState().workspaceKeybindings;

      if (matchesKeybinding(e, bindings.toggleWorktree)) {
        e.preventDefault();
        onToggleWorktree();
        return;
      }

      if (matchesKeybinding(e, bindings.toggleRepository)) {
        e.preventDefault();
        onToggleRepository();
        return;
      }

      if (matchesKeybinding(e, bindings.switchActiveWorktree)) {
        e.preventDefault();
        onSwitchActiveWorktree();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onToggleWorktree, onToggleRepository, onSwitchActiveWorktree]);
}
