import GlassCard from "./glass-card";

export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="text-center !py-5 !px-4">
      <div className="text-[30px] font-bold text-accent tracking-tight font-en">
        {value}
      </div>
      <div className="text-[13px] opacity-50 mt-1.5">{label}</div>
    </GlassCard>
  );
}
