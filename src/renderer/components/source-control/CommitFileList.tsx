import type { CommitFileChange } from '@shared/types';
import { ChevronRight, FileEdit, FilePlus, FileX, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TFunction } from '@/i18n';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface CommitFileListProps {
  files: CommitFileChange[];
  selectedFile: string | null;
  onFileClick: (path: string) => void;
  isLoading?: boolean;
  commitHash?: string;
}

function getFileIcon(status: CommitFileChange['status']) {
  switch (status) {
    case 'A':
      return FilePlus;
    case 'D':
      return FileX;
    default:
      return FileEdit;
  }
}

function getStatusText(status: CommitFileChange['status'], t: TFunction) {
  switch (status) {
    case 'A':
      return t('Added');
    case 'D':
      return t('Deleted');
    case 'M':
      return t('Modified');
    case 'R':
      return t('Renamed');
    case 'C':
      return t('Copied');
    case 'X':
      return t('Conflict');
    default:
      return '';
  }
}

function getStatusColor(status: CommitFileChange['status']) {
  switch (status) {
    case 'A':
      return 'text-green-500';
    case 'D':
      return 'text-red-500';
    case 'M':
      return 'text-yellow-500';
    case 'R':
    case 'C':
      return 'text-blue-500';
    case 'X':
      return 'text-orange-500';
    default:
      return 'text-muted-foreground';
  }
}

export function CommitFileList({
  files,
  selectedFile,
  onFileClick,
  isLoading = false,
  commitHash,
}: CommitFileListProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center text-muted-foreground">
        <p className="text-sm">{t('No file changes in this commit')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b px-4 py-2">
        <h3 className="text-sm font-medium">
          {t('Changed files ({{count}})', { count: files.length })}
        </h3>
        {commitHash && (
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            {commitHash.substring(0, 7)}
          </p>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.status);
            const isSelected = selectedFile === file.path;
            return (
              <button
                type="button"
                key={file.path}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left transition-colors',
                  isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )}
                onClick={() => onFileClick(file.path)}
              >
                <Icon className={cn('h-4 w-4 shrink-0', getStatusColor(file.status))} />
                <span className="min-w-0 flex-1 truncate text-sm">{file.path}</span>
                <span className={cn('shrink-0 text-xs', getStatusColor(file.status))}>
                  {getStatusText(file.status, t)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
