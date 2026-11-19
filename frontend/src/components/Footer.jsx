import { Link } from 'react-router-dom'
import { DoodleSparkle } from './Doodles'

export default function Footer() {
  return (
    <footer className="border-t border-[#EBC69F]/80 bg-gradient-to-br from-[#291C2E] via-[#373152] to-[#291C2E] text-[#FFF3E4]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-editorial text-2xl font-bold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-xl bg-[#E6B95F] text-[#291C2E] font-bold text-sm">
                CG
              </span>
              <span>
                Churn<span className="text-[#E6B95F]">Guard</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm text-[#F4D3B5]/80 leading-relaxed">
              AI-based customer retention and churn intelligence platform. Built for online sellers, retail shops, and businesses looking to retain valuable customer relationships.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#EBC69F]">
              <DoodleSparkle size={14} />
              <span>Editorial SaaS Design • Final-year B.Tech Research Project</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#EBC69F]">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-[#F4D3B5]/85">
              <li><Link to="/workspace" className="hover:text-[#E6B95F] transition">Retention Console</Link></li>
              <li><Link to="/workspace/predict" className="hover:text-[#E6B95F] transition">Single Customer Predict</Link></li>
              <li><Link to="/workspace/upload" className="hover:text-[#E6B95F] transition">Bulk CSV Inference</Link></li>
              <li><Link to="/pricing" className="hover:text-[#E6B95F] transition">Plans & Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#EBC69F]">Project</p>
            <ul className="mt-3 space-y-2 text-sm text-[#F4D3B5]/85">
              <li><Link to="/about" className="hover:text-[#E6B95F] transition">Methodology & Dataset</Link></li>
              <li><Link to="/docs" className="hover:text-[#E6B95F] transition">System Documentation</Link></li>
              <li><Link to="/contact" className="hover:text-[#E6B95F] transition">Contact & Support</Link></li>
              <li><Link to="/terms" className="hover:text-[#E6B95F] transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#373152] pt-6 text-xs text-[#A99BB9]">
          <p>© {new Date().getFullYear()} ChurnGuard. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#FFF3E4]">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#FFF3E4]">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
