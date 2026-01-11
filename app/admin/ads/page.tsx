"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Megaphone, Plus, Trash2, ExternalLink, Power, PowerOff, BarChart3, Image as ImageIcon } from "lucide-react"
import { getAllAds, createAd, updateAd, deleteAd, Ad } from "@/lib/services/adsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // Form state
  const [newAd, setNewAd] = useState<Omit<Ad, "id" | "createdAt" | "clicks">>({
    title: "",
    imageUrl: "",
    link: "",
    variant: "banner",
    active: true
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    setLoading(true)
    const data = await getAllAds()
    setAds(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAd(newAd)
      setNewAd({ title: "", imageUrl: "", link: "", variant: "banner", active: true })
      setIsAdding(false)
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء إنشاء الإعلان")
    }
  }

  const handleToggleActive = async (ad: Ad) => {
    if (!ad.id) return
    try {
      await updateAd(ad.id, { active: !ad.active })
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء تحديث الحالة")
    }
  }

  const handleDelete = async (adId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return
    try {
      await deleteAd(adId)
      fetchAds()
    } catch (error) {
      alert("خطأ أثناء الحذف")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">إدارة الإعلانات</h2>
          <p className="text-slate-400 mt-1">التحكم في المساحات الإعلانية والبانرات</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 h-auto"
        >
          {isAdding ? "إلغاء الإضافة" : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              إضافة إعلان جديد
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-hidden"
        >
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">عنوان الإعلان</label>
                <Input 
                  value={newAd.title}
                  onChange={e => setNewAd({...newAd, title: e.target.value})}
                  placeholder="مثال: خصم 50% على اشتراكات الطلاب" 
                  className="bg-slate-950/50 border-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">رابط الصورة (URL)</label>
                <Input 
                  value={newAd.imageUrl}
                  onChange={e => setNewAd({...newAd, imageUrl: e.target.value})}
                  placeholder="https://example.com/banner.png" 
                  className="bg-slate-950/50 border-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">رابط التوجيه (Link)</label>
                <Input 
                  value={newAd.link}
                  onChange={e => setNewAd({...newAd, link: e.target.value})}
                  placeholder="https://example.com/promo" 
                  className="bg-slate-950/50 border-slate-800"
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 block">مكان الظهور (Variant)</label>
                <select 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-slate-300 outline-none focus:border-indigo-500/50"
                  value={newAd.variant}
                  onChange={e => setNewAd({...newAd, variant: e.target.value as any})}
                >
                  <option value="banner">بانر علوي (Banner)</option>
                  <option value="box">مربع (Box)</option>
                  <option value="sidebar">جانبي (Sidebar)</option>
                </select>
              </div>
              <div className="pt-8">
                <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold py-4 h-auto rounded-xl">
                  تأكيد الإضافة ونشر الإعلان
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Ads List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري تحميل البيانات...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl text-slate-500">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>لا يوجد إعلانات مضافة حالياً</p>
          </div>
        ) : ads.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border ${ad.active ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/20'} backdrop-blur-sm group`}
          >
            {/* Preview Image */}
            <div className="w-full md:w-48 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
               {ad.imageUrl ? (
                 <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
               ) : (
                 <ImageIcon className="w-8 h-8 text-slate-800" />
               )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ad.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {ad.active ? 'Active' : 'Draft'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ad.variant}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-100">{ad.title}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-indigo-400" />
                {ad.link}
              </p>
            </div>

            {/* Metrics */}
            <div className="px-6 border-x border-slate-800/50 hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-500">إجمالي النقرات</span>
              </div>
              <p className="text-2xl font-black text-slate-100">{ad.clicks || 0}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggleActive(ad)}
                className={`p-3 rounded-xl border transition-all ${ad.active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                title={ad.active ? "إيقاف" : "تفعيل"}
              >
                {ad.active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => handleDelete(ad.id!)}
                className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                title="حذف"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
