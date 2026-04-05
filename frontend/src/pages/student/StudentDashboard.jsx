import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicInfoAPI } from '../../services/api';
import {
    Clock, Coffee, Utensils, CalendarDays, FlaskConical,
    Calculator, ShieldCheck, AlertCircle, ClipboardList, FlaskRound, TreePalm
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const InfoCard = ({ icon: Icon, title, value, color, bg }) => (
    <div className="card hover:shadow-md transition-all">
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

const SectionHeader = ({ emoji, title, badge }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{emoji}</span>
        <h2 className="font-bold text-slate-900">{title}</h2>
        {badge && (
            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">{badge}</span>
        )}
    </div>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [academicInfo, setAcademicInfo] = useState(null);
    const [infoLoading, setInfoLoading] = useState(true);

    useEffect(() => {
        academicInfoAPI.get()
            .then((res) => setAcademicInfo(res.data.academicInfo))
            .catch(console.error)
            .finally(() => setInfoLoading(false));
    }, []);

    return (
        <div className="flex-1 p-6 space-y-8 fade-in">
            {/* Welcome message */}
            <div>
                <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Your academic information and college guidelines — all in one place.
                </p>
            </div>

            {/* Academic Info Sections */}
            {infoLoading ? (
                <div className="flex items-center justify-center py-16">
                    <LoadingSpinner size="sm" text="Loading academic info..." />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Academic Information */}
                    <div>
                        <SectionHeader emoji="📚" title="Academic Information" badge="Updated by Admin" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={ShieldCheck} title="Rules & Regulations"       value={academicInfo?.rulesAndRegulations}    color="text-indigo-600" bg="bg-indigo-50" />
                            <InfoCard icon={ClipboardList} title="Exam Guidelines"         value={academicInfo?.examGuidelines}         color="text-blue-600"   bg="bg-blue-50"   />
                            <InfoCard icon={FlaskRound}    title="Lab Rules"               value={academicInfo?.labRules}               color="text-cyan-600"   bg="bg-cyan-50"   />
                        </div>
                    </div>

                    {/* Timing Information */}
                    <div>
                        <SectionHeader emoji="⏰" title="Timing Information" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={Clock}    title="Biometric Timing" value={academicInfo?.biometricTiming}   color="text-violet-600" bg="bg-violet-50" />
                            <InfoCard icon={Coffee}   title="Break Time"       value={academicInfo?.breakTime}         color="text-amber-600"  bg="bg-amber-50"  />
                            <InfoCard icon={Utensils} title="Lunch Time"       value={academicInfo?.lunchTime}         color="text-orange-600" bg="bg-orange-50" />
                        </div>
                    </div>

                    {/* Academic Schedule */}
                    <div>
                        <SectionHeader emoji="📅" title="Academic Schedule" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={CalendarDays}  title="Internal Test Dates"  value={academicInfo?.internalTestDates}   color="text-sky-600"     bg="bg-sky-50"     />
                            <InfoCard icon={FlaskConical}  title="Practical Exam Dates" value={academicInfo?.practicalExamDates}  color="text-emerald-600" bg="bg-emerald-50" />
                            <InfoCard icon={TreePalm}      title="Holidays"             value={academicInfo?.holidays}           color="text-green-600"   bg="bg-green-50"   />
                        </div>
                    </div>

                    {/* Marks Information */}
                    <div>
                        <SectionHeader emoji="🧮" title="Marks Information" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={Calculator} title="Internal Marks Calculation" value={academicInfo?.internalMarksCalculation} color="text-rose-600" bg="bg-rose-50" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
