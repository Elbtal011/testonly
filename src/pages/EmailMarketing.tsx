import React, { useMemo, useState } from 'react';
import { Mail, Upload, FileText, Info } from 'lucide-react';

interface ParsedRecipients {
  recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
  valid: number;
  invalid: number;
  duplicates: number;
  processed: number;
}

export const EmailMarketing: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('no-reply@example.com');
  const [fromProfile, setFromProfile] = useState('no-reply@example.com');
  const [replyTo, setReplyTo] = useState('');
  const [batchSize, setBatchSize] = useState(100);
  const [pauseMs, setPauseMs] = useState(0);
  const [htmlContent, setHtmlContent] = useState('<h1>Hello!</h1>\n<p>Your message here.</p>');
  const [recipientsSummary, setRecipientsSummary] = useState<ParsedRecipients | null>(null);
  const [recipientFileName, setRecipientFileName] = useState<string>('');
  const [recipientPreview, setRecipientPreview] = useState<string>('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpSecurity, setSmtpSecurity] = useState('STARTTLS');
  const [senderEmails, setSenderEmails] = useState<string[]>([
    'no-reply@example.com',
    'support@example.com',
    'billing@example.com'
  ]);
  const [newSenderEmail, setNewSenderEmail] = useState('');

  const processRecipientFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      const lines = content.split(/\r?\n/).filter(Boolean);
      const emails = lines.map((line) => line.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const unique = new Set<string>();
      let valid = 0;
      let invalid = 0;
      let duplicates = 0;

      const parsedRecipients = emails
        .filter((email) => email.length > 0)
        .map((email) => {
          if (!emailRegex.test(email)) {
            invalid += 1;
            return null;
          }
          if (unique.has(email)) {
            duplicates += 1;
            return null;
          }
          unique.add(email);
          valid += 1;
          return { email };
        })
        .filter(Boolean) as Array<{ email: string }>;

      setRecipientPreview(lines.slice(0, 10).join('\n'));
      setRecipientsSummary({
        recipients: parsedRecipients,
        valid,
        invalid,
        duplicates,
        processed: emails.length
      });
    };

    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRecipientFileName(file.name);
    processRecipientFile(file);
  };

  const summaryText = useMemo(() => {
    if (!recipientsSummary) return 'No recipient list uploaded.';
    return `${recipientsSummary.valid} valid • ${recipientsSummary.invalid} invalid • ${recipientsSummary.duplicates} duplicates`;
  }, [recipientsSummary]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-Mail Marketing</h1>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-600 cursor-not-allowed"
          disabled
        >
          Send Campaign (Disabled)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
            <Mail className="h-5 w-5 text-red-600" />
            Sender & Routing
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
              <input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="BankingSuite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
              <select
                value={fromProfile}
                onChange={(e) => {
                  setFromProfile(e.target.value);
                  setFromEmail(e.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                style={{ height: '38px' }}
              >
                {senderEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
                <option value="custom">Custom…</option>
              </select>
              {fromProfile === 'custom' && (
                <input
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="custom@example.com"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
              <input
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                style={{ height: '38px' }}
              >
                <option>HTML</option>
                <option>Plain Text</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
            <Mail className="h-5 w-5 text-red-600" />
            SMTP Settings
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="mail.yourdomain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                type="number"
                min={1}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
              <input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="maileradmin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
              <input
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Security</label>
              <select
                value={smtpSecurity}
                onChange={(e) => setSmtpSecurity(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                style={{ height: '38px' }}
              >
                <option value="STARTTLS">TLS (STARTTLS)</option>
                <option value="SSL">SSL</option>
                <option value="NONE">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Sender Email</label>
              <div className="flex gap-2">
                <input
                  value={newSenderEmail}
                  onChange={(e) => setNewSenderEmail(e.target.value)}
                  type="email"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="marketing@example.com"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newSenderEmail.trim();
                    if (!trimmed) return;
                    if (!senderEmails.includes(trimmed)) {
                      setSenderEmails((prev) => [...prev, trimmed]);
                    }
                    setFromProfile(trimmed);
                    setFromEmail(trimmed);
                    setNewSenderEmail('');
                  }}
                  className="px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Added emails appear in the “From Email” selector.</p>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full px-4 py-2 rounded-md bg-gray-200 text-gray-600 cursor-not-allowed"
                disabled
              >
                Test Connection (Disabled)
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
            <FileText className="h-5 w-5 text-red-600" />
            Campaign
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Security update required"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients (CSV/TXT)</label>
              <div className="rounded-md border border-dashed border-gray-300 p-4">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                {recipientFileName && (
                  <p className="text-xs text-gray-500 mt-2">Selected: {recipientFileName}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">{summaryText}</p>
              {recipientPreview && (
                <pre className="mt-3 bg-gray-50 rounded p-3 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {recipientPreview}
                </pre>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                <input
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pause Between Batches (ms)</label>
                <input
                  value={pauseMs}
                  onChange={(e) => setPauseMs(Number(e.target.value))}
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
          <Upload className="h-5 w-5 text-red-600" />
          Message Editor
        </div>
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          className="w-full min-h-[260px] rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-red-500 focus:border-red-500"
        />
      </div>
    </div>
  );
};
