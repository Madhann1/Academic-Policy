const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full loading-spinner`}
            />
            {text && <p className="text-slate-500 text-sm">{text}</p>}
        </div>
    );
};

export const FullPageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
    </div>
);

export default LoadingSpinner;
