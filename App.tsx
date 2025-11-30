import React, { useState, useCallback, useEffect, useMemo, createContext, useContext, memo } from 'react';

type StatusType = 'info' | 'success' | 'error' | 'warning';

interface Status {
  message: string;
  type: StatusType;
}

interface Printer {
  name: string;
  status: string;
  rawStatus: string;
}

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) return stored;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ThemeToggle: React.FC = memo(() => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="text-slate-700" />
      ) : (
        <SunIcon className="text-slate-200" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

const StatusMessage: React.FC<{ status: Status | null; }> = memo(({ status }) => {
  if (!status) {
    return null;
  }
  const { message, type } = status;
  const statusStyles: Record<StatusType, string> = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };
  const style = statusStyles[type];
  return <p id="status" className={`text-sm font-medium text-center ${style}`}>{message}</p>;
});

StatusMessage.displayName = 'StatusMessage';

const CustomNumberInput: React.FC<{ id: string, name: string, min?: number, defaultValue?: number, required?: boolean }> = memo(({ id, name, min = 1, defaultValue = 1, required }) => {
    const [count, setCount] = useState(defaultValue);

    const handleDecrement = useCallback(() => {
        setCount(prev => Math.max(min, prev - 1));
    }, [min]);

    const handleIncrement = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setCount('' as any);
            return;
        }

        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setCount(numValue);
        }
    }, []);

    const handleInputBlur = useCallback(() => {
        if (count === '' || count < min) {
            setCount(min);
        }
    }, [count, min]);

    const buttonClasses = "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 p-3 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors duration-200";

    return (
        <div className="flex flex-row h-11 w-full rounded-md shadow-sm border border-slate-300 dark:border-slate-600 overflow-hidden">
            <button
                type="button"
                onClick={handleDecrement}
                className={`${buttonClasses} rounded-l-md`}
                aria-label="Decrement copies"
            >
                <MinusIcon className="w-4 h-4" />
            </button>
            <input
                type="text"
                id={id}
                name={name}
                value={count}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required={required}
                className="w-full text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-0 border-none focus:outline-none"
                aria-live="polite"
                aria-valuenow={typeof count === 'number' ? count : min}
                min={min}
            />
             <button
                type="button"
                onClick={handleIncrement}
                className={`${buttonClasses} rounded-r-md`}
                aria-label="Increment copies"
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
    );
});

CustomNumberInput.displayName = 'CustomNumberInput';

const PrinterSelector: React.FC<{
  printers: Printer[];
  selectedPrinter: string | null;
  onSelectPrinter: (printerName: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}> = memo(({ printers, selectedPrinter, onSelectPrinter, onRefresh, isLoading }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="printer-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Printer
        </label>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh printer list"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <select
        id="printer-select"
        value={selectedPrinter || ''}
        onChange={(e) => onSelectPrinter(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isLoading || printers.length === 0}
      >
        <option value="">
          {printers.length === 0 ? 'No printers available' : 'Select a printer...'}
        </option>
        {printers.map((printer) => (
          <option key={printer.name} value={printer.name}>
            {printer.name} ({printer.status})
          </option>
        ))}
      </select>
      {selectedPrinter && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Current printer: <span className="font-medium">{selectedPrinter}</span>
        </p>
      )}
    </div>
  );
});

PrinterSelector.displayName = 'PrinterSelector';

const PrintForm: React.FC<{ onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isLoading: boolean; fileInputRef: React.RefObject<HTMLInputElement> }> = memo(({ onSubmit, isLoading, fileInputRef }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName(null);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      setFileName(null);
    }
  }, [fileInputRef]);

  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).resetFileName = () => setFileName(null);
    }
  }, [fileInputRef]);

  return (
    <form id="printForm" onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md bg-slate-50 dark:bg-slate-800/50">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className="flex text-sm text-slate-600 dark:text-slate-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input ref={fileInputRef} id="file-upload" name="file" type="file" className="sr-only" required onChange={handleFileChange} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            {fileName && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{fileName}</p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Remove file"
                >
                  <XIcon className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="copies" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Copies</label>
        <div className="mt-1">
          <CustomNumberInput name="copies" id="copies" defaultValue={1} min={1} required />
        </div>
      </div>
      <div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200">
          {isLoading ? 'Sending...' : 'Print Document'}
        </button>
      </div>
    </form>
  );
});

PrintForm.displayName = 'PrintForm';

function AppContent() {
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [isPrinterLoading, setIsPrinterLoading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status && (status.type === 'success' || status.type === 'error')) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Load printers and saved config on mount
  useEffect(() => {
    fetchPrinters();
    loadSavedPrinter();
  }, []);

  const fetchPrinters = useCallback(async () => {
    setIsPrinterLoading(true);
    try {
      const response = await fetch('/api/printers');
      const data = await response.json();

      if (response.ok) {
        setPrinters(data.printers || []);
        if (data.printers.length === 0) {
          setStatus({
            message: 'No printers found. Make sure CUPS is configured.',
            type: 'warning'
          });
        }
      } else {
        setStatus({
          message: 'Failed to load printers. Check CUPS configuration.',
          type: 'error'
        });
        setPrinters([]);
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
      setStatus({
        message: 'Error connecting to printer service.',
        type: 'error'
      });
      setPrinters([]);
    } finally {
      setIsPrinterLoading(false);
    }
  }, []);

  const loadSavedPrinter = useCallback(async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();

      if (response.ok && data.configured && data.printerName) {
        setSelectedPrinter(data.printerName);
      }
    } catch (error) {
      console.error('Error loading saved printer:', error);
    }
  }, []);

  const handleSelectPrinter = useCallback(async (printerName: string) => {
    if (!printerName) {
      setSelectedPrinter(null);
      return;
    }

    setSelectedPrinter(printerName);

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ printerName }),
      });

      if (response.ok) {
        setStatus({
          message: `Printer "${printerName}" saved successfully.`,
          type: 'success'
        });
      } else {
        setStatus({
          message: 'Failed to save printer selection.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving printer:', error);
      setStatus({
        message: 'Error saving printer selection.',
        type: 'error'
      });
    }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPrinter) {
      setStatus({
        message: 'Please select a printer first.',
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Uploading and sending to printer...', type: 'info' });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          message: `Success! Print job sent to ${data.printer}.`,
          type: 'success'
        });
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
          (fileInputRef.current as any).resetFileName?.();
        }
      } else {
        console.error('Print job failed:', response.status, data);
        setStatus({
          message: `Error: ${data.error || 'Could not send print job.'}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setStatus({ message: 'Error: An unexpected network error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPrinter]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden relative transition-colors duration-300">
        <ThemeToggle />
        <div className="p-8">
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="bg-indigo-500 dark:bg-indigo-600 p-4 rounded-full text-white">
              <PrinterIcon className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">{import.meta.env.VITE_APP_TITLE || 'PrintRelay'}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-center">Upload a document and send it directly to the printer.</p>
          </div>

          <div className="mb-6">
            <PrinterSelector
              printers={printers}
              selectedPrinter={selectedPrinter}
              onSelectPrinter={handleSelectPrinter}
              onRefresh={fetchPrinters}
              isLoading={isPrinterLoading}
            />
          </div>

          <PrintForm onSubmit={handleSubmit} isLoading={isLoading} fileInputRef={fileInputRef} />

          <div className="mt-6 h-6">
            <StatusMessage status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;