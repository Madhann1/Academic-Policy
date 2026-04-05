import { useState, useEffect } from 'react';
import { academicInfoAPI } from '../../services/api';
import {
    BookOpen, Clock, Coffee, Utensils, CalendarDays, FlaskConical,
    Calculator, AlertCircle, ClipboardList, FlaskRound, TreePalm, Eye
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const InfoCard = ({ icon: Icon, title, value, color, bg }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
        {value ? (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{value}</p>
        ) : (
            <p className="text-xs text-slate-400 italic flex items-center gap-1">
                <AlertCircle size={12} /> Not configured yet
            </p>
        )}
    </div>
);

const SectionGroup = ({ label, emoji, children, borderColor }) => (
    <div>
        <h2 className={`font-bold text-slate-800 mb-3 flex items-center gap-2 pb-2 border-b-2 ${borderColor}`}>
            <span>{emoji}</span> {label}
            <span className="text-xs font-normal text-slate-400 ml-auto">Read-only</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const HODAcademicView = () => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        academicInfoAPI.get()
            .then((res) => setInfo(res.data.academicInfo))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex-1 p-6 space-y-6 fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Eye size={22} className="text-teal-600" />
                        Academic Information
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        View academic policies, schedules, and rules configured by the admin
                    </p>
                </div>
            </div>

            {/* Read-only banner */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-700 flex items-center gap-2">
                <Eye size={16} className="flex-shrink-0" />
                This page is view-only. Contact the administrator to make changes.
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <LoadingSpinner text="Loading academic info..." />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Academic Information */}
                    <SectionGroup label="Academic Information" emoji="📚" borderColor="border-indigo-300">
                        <InfoCard icon={BookOpen} title="Rules & Regulations" value={info?.rulesAndRegulations} color="text-indigo-600" bg="bg-indigo-50" />
                        <InfoCard icon={ClipboardList} title="Exam Guidelines" value={info?.examGuidelines} color="text-blue-600" bg="bg-blue-50" />
                        <InfoCard icon={FlaskRound} title="Lab Rules" value={info?.labRules} color="text-cyan-600" bg="bg-cyan-50" />
                    </SectionGroup>

                    {/* Timing Information */}
                    <SectionGroup label="Timing Information" emoji="⏰" borderColor="border-amber-300">
                        <InfoCard icon={Clock} title="Biometric Timing" value={info?.biometricTiming} color="text-violet-600" bg="bg-violet-50" />
                        <InfoCard icon={Coffee} title="Break Time" value={info?.breakTime} color="text-amber-600" bg="bg-amber-50" />
                        <InfoCard icon={Utensils} title="Lunch Time" value={info?.lunchTime} color="text-orange-600" bg="bg-orange-50" />
                    </SectionGroup>

                    {/* Academic Schedule */}
                    <SectionGroup label="Academic Schedule" emoji="📅" borderColor="border-sky-300">
                        <InfoCard icon={CalendarDays} title="Internal Test Dates" value={info?.internalTestDates} color="text-sky-600" bg="bg-sky-50" />
                        <InfoCard icon={FlaskConical} title="Practical Exam Dates" value={info?.practicalExamDates} color="text-emerald-600" bg="bg-emerald-50" />
                        <InfoCard icon={TreePalm} title="Holidays" value={info?.holidays} color="text-green-600" bg="bg-green-50" />
                    </SectionGroup>

                    {/* Marks Information */}
                    <SectionGroup label="Marks Information" emoji="🧮" borderColor="border-rose-300">
                        <InfoCard icon={Calculator} title="Internal Marks Calculation" value={info?.internalMarksCalculation} color="text-rose-600" bg="bg-rose-50" />
                    </SectionGroup>
                </div>
            )}
        </div>
    );
};

export default HODAcademicView;
