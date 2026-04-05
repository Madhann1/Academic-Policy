const statusConfig = {
    Draft: { class: 'badge-draft', dot: 'bg-slate-400' },
    Pending: { class: 'badge-pending', dot: 'bg-amber-400' },
    Approved: { class: 'badge-approved', dot: 'bg-emerald-400' },
    Rejected: { class: 'badge-rejected', dot: 'bg-red-400' },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || { class: 'badge-draft', dot: 'bg-slate-400' };
    return (
        <span className={config.class}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
            {status}
        </span>
    );
};

export default StatusBadge;
