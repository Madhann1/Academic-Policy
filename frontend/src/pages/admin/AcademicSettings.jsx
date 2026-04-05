import { useState, useEffect } from 'react';
import { academicInfoAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    BookOpen, Clock, Coffee, Utensils, CalendarDays, FlaskConical,
    Calculator, Save, RefreshCw, Settings, ClipboardList, FlaskRound,
    TreePalm
} from 'lucide-react';

const fieldGroups = [
    {
        groupLabel: '📚 Academic Information',
        color: 'border-indigo-200 bg-indigo-50/40',
        titleColor: 'text-indigo-700',
        fields: [
            {
                key: 'rulesAndRegulations',
                label: 'College Rules & Regulations',
                icon: BookOpen,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                placeholder: 'Enter college rules and regulations...',
                rows: 5,
            },
            {
                key: 'examGuidelines',
                label: 'Exam Guidelines',
                icon: ClipboardList,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                placeholder: 'e.g. No electronic devices allowed. ID cards mandatory. Reach 10 min before exam.',
                rows: 4,
            },
            {
                key: 'labRules',
                label: 'Lab Rules',
                icon: FlaskRound,
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
                placeholder: 'e.g. Wear lab coats. No food or drinks. Follow safety protocols.',
                rows: 4,
            },
        ],
    },
    {
        groupLabel: '⏰ Timing Information',
        color: 'border-amber-200 bg-amber-50/40',
        titleColor: 'text-amber-700',
        fields: [
            {
                key: 'biometricTiming',
                label: 'Biometric Timing Rules',
                icon: Clock,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                placeholder: 'e.g. Morning: 9:00 AM – 9:15 AM | Late after 9:30 AM',
                rows: 3,
            },
            {
                key: 'breakTime',
                label: 'Break Time',
                icon: Coffee,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                placeholder: 'e.g. 11:00 AM – 11:15 AM',
                rows: 3,
            },
            {
                key: 'lunchTime',
                label: 'Lunch Time',
                icon: Utensils,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                placeholder: 'e.g. 1:00 PM – 1:45 PM',
                rows: 3,
            },
        ],
    },
    {
        groupLabel: '📅 Academic Schedule',
        color: 'border-sky-200 bg-sky-50/40',
        titleColor: 'text-sky-700',
        fields: [
            {
                key: 'internalTestDates',
                label: 'Internal Test Dates',
                icon: CalendarDays,
                color: 'text-sky-600',
                bg: 'bg-sky-50',
                placeholder: 'e.g. CAT 1: 10–14 Feb | CAT 2: 24–28 Mar',
                rows: 3,
            },
            {
                key: 'practicalExamDates',
                label: 'Practical Exam Dates',
                icon: FlaskConical,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                placeholder: 'e.g. Lab Exams: 15–20 Mar',
                rows: 3,
            },
            {
                key: 'holidays',
                label: 'Holidays',
                icon: TreePalm,
                color: 'text-green-600',
                bg: 'bg-green-50',
                placeholder: 'e.g. Pongal: Jan 14-15 | Republic Day: Jan 26 | Holi: Mar 13...',
                rows: 4,
            },
        ],
    },
    {
        groupLabel: '🧮 Marks Information',
        color: 'border-rose-200 bg-rose-50/40',
        titleColor: 'text-rose-700',
        fields: [
            {
                key: 'internalMarksCalculation',
                label: 'Internal Marks Calculation Rules',
                icon: Calculator,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
                placeholder: 'e.g. CAT 1 (25) + CAT 2 (25) + Assignment (10) + Attendance (15) = 75',
                rows: 5,
            },
        ],
    },
];

const emptyForm = {
    rulesAndRegulations: '',
    examGuidelines: '',
    labRules: '',
    biometricTiming: '',
    breakTime: '',
    lunchTime: '',
    internalTestDates: '',
    practicalExamDates: '',
    holidays: '',
    internalMarksCalculation: '',
};

const AcademicSettings = () => {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        academicInfoAPI.get()
            .then((res) => {
                const info = res.data.academicInfo;
                setForm({
                    rulesAndRegulations: info.rulesAndRegulations || '',
                    examGuidelines: info.examGuidelines || '',
                    labRules: info.labRules || '',
                    biometricTiming: info.biometricTiming || '',
                    breakTime: info.breakTime || '',
                    lunchTime: info.lunchTime || '',
                    internalTestDates: info.internalTestDates || '',
                    practicalExamDates: info.practicalExamDates || '',
                    holidays: info.holidays || '',
                    internalMarksCalculation: info.internalMarksCalculation || '',
                });
            })
            .catch(() => toast.error('Failed to load academic info'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await academicInfoAPI.update(form);
            toast.success('Academic info updated successfully!');
        } catch {
            toast.error('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Settings size={22} className="text-indigo-600" />
                        Academic Settings
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Configure academic rules, schedules, and policies visible to students and HOD
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60"
                >
                    {saving ? (
                        <RefreshCw size={16} className="animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Info banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-700 flex items-center gap-2">
                <BookOpen size={16} className="flex-shrink-0" />
                These values will be displayed on every student's dashboard and the HOD Academic Info page as read-only information.
            </div>

            {/* Grouped Fields */}
            {fieldGroups.map(({ groupLabel, color, titleColor, fields }) => (
                <div key={groupLabel} className={`border rounded-2xl p-5 space-y-4 ${color}`}>
                    <h2 className={`font-bold text-base ${titleColor}`}>{groupLabel}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {fields.map(({ key, label, icon: Icon, color: iconColor, bg, placeholder, rows }) => (
                            <div key={key} className="card bg-white">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                                    <span className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={16} className={iconColor} />
                                    </span>
                                    {label}
                                </label>
                                <textarea
                                    rows={rows}
                                    value={form[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-slate-50 hover:bg-white transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Bottom Save */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl disabled:opacity-60"
                >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default AcademicSettings;
