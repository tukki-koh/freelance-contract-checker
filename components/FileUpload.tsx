'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'

interface FileUploadProps {
  onAnalyze: (file: File | null, text: string) => void
  loading: boolean
  disabled?: boolean
}

export function FileUpload({ onAnalyze, loading, disabled = false }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'file' | 'text'>('file')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: loading || disabled,
  })

  const handleSubmit = () => {
    if (mode === 'file' && file) {
      onAnalyze(file, '')
    } else if (mode === 'text' && text.trim()) {
      onAnalyze(null, text)
    }
  }

  const canSubmit = !disabled && (mode === 'file' ? !!file : text.trim().length > 0)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('file')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          )}
        >
          ファイルアップロード
        </button>
        <button
          onClick={() => setMode('text')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          )}
        >
          テキスト貼り付け
        </button>
      </div>

      {mode === 'file' ? (
        <div>
          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800 p-4">
              <FileText className="h-8 w-8 text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className={cn(
                'mx-auto h-10 w-10 mb-3 transition-colors',
                isDragActive ? 'text-blue-400' : 'text-slate-500'
              )} />
              <p className="text-sm font-medium text-slate-300">
                {isDragActive ? 'ここにドロップ' : 'クリックまたはドラッグ＆ドロップ'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PDF・JPG・PNG・WebP・TXT（最大10MB）
              </p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="契約書のテキストをここに貼り付けてください..."
          rows={10}
          className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          disabled={loading}
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={loading}
        size="lg"
        className="w-full"
      >
        {loading ? '分析中...' : '契約書を分析する'}
      </Button>
    </div>
  )
}
