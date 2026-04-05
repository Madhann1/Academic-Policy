import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FORM_TYPES = [
    'Transport Requisition',
    'Annexure 2A - Subject Expert Recommendation',
    'Guest Accommodation',
];

const TRANSPORT_FIELDS = [
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'travelDate', label: 'Travel Date', type: 'date', required: true },
    { name: 'returnDate', label: 'Return Date', type: 'date', required: true },
    { name: 'purpose', label: 'Purpose of Travel', type: 'text', required: true },
    { name: 'numberOfPersons', label: 'Number of Persons', type: 'number', required: true },
    { name: 'vehicleType', label: 'Vehicle Type', type: 'text' },
];

const ANNEXURE_FIELDS = [
    { name: 'subjectName', label: 'Subject Name', type: 'text', required: true },
    { name: 'expertName', label: 'Expert Full Name', type: 'text', required: true },
    { name: 'expertDesignation', label: 'Expert Designation', type: 'text', required: true },
    { name: 'expertInstitution', label: 'Expert Institution', type: 'text', required: true },
    { name: 'proposedDate', label: 'Proposed Date', type: 'date', required: true },
    { name: 'topicsCovered', label: 'Topics to be Covered', type: 'text', required: true },
];

const GUEST_FIELDS = [
    { name: 'guestName', label: 'Guest Name', type: 'text', required: true },
    { name: 'guestDesignation', label: 'Guest Designation', type: 'text', required: true },
    { name: 'guestInstitution', label: 'Guest Institution', type: 'text', required: true },
    { name: 'checkInDate', label: 'Check-In Date', type: 'date', required: true },
    { name: 'checkOutDate', label: 'Check-Out Date', type: 'date', required: true },
    { name: 'roomType', label: 'Room Type', type: 'text' },
    { name: 'specialRequirements', label: 'Special Requirements', type: 'text' },
];

const FIELDS_MAP = {
    'Transport Requisition': TRANSPORT_FIELDS,
    'Annexure 2A - Subject Expert Recommendation': ANNEXURE_FIELDS,
    'Guest Accommodation': GUEST_FIELDS,
};

const ServiceRequestForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') || FORM_TYPES[0];

    const [formType, setFormType] = useState(initialType);
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setDetails({});
    }, [formType]);

    const fields = FIELDS_MAP[formType] || [];

    const handleChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await requestAPI.create({ formType, details });
            toast.success('Request submitted successfully');
            navigate('/faculty/requests');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="flex-1 p-6 fade-in">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Submit Service Request</h1>
                    <p className="text-slate-500 text-sm mt-1">Fill in the form and submit for admin approval</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Form Type Selector */}
                    <div>
                        <label className="form-label">Request Type *</label>
                        <div className="grid grid-cols-1 gap-2">
                            {FORM_TYPES.map((t) => (
                                <label key={t} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formType === t ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input type="radio" name="formType" value={t} checked={formType === t} onChange={() => setFormType(t)} className="text-indigo-600" />
                                    <span className="text-sm font-medium text-slate-700">{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Dynamic Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map(({ name, label, type, required }) => (
                            <div key={name} className={type === 'text' && name.includes('purpose') || name.includes('topics') ? 'sm:col-span-2' : ''}>
                                <label className="form-label">{label}{required ? ' *' : ''}</label>
                                <input
                                    type={type}
                                    name={name}
                                    value={details[name] || ''}
                                    onChange={handleChange}
                                    required={required}
                                    className="input-field"
                                    min={type === 'number' ? 1 : undefined}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/faculty/requests')} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceRequestForm;
