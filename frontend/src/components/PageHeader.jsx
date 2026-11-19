import { DoodleSparkle } from './Doodles'

export default function PageHeader({ title, description, action, badge }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#EBC69F]/50 pb-5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#494269]/70">
            Workspace / {title}
          </p>
          {badge && (
            <span className="rounded-full bg-[#EBC69F]/50 px-2 py-0.5 text-[10px] font-bold text-[#494269]">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#291C2E] sm:text-4xl">
            {title}
          </h1>
          <DoodleSparkle size={18} className="text-[#E6B95F]" />
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#392D35]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
